import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { connectRedis, redisClient } from '../redis';

interface ChatSession {
  chatId: string;
  createdAt: string;
  createdBy: string;
}

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

const router = Router();
const CHAT_EXPIRE_SECONDS = 7 * 24 * 60 * 60;
const MAX_MESSAGES = 500;

const getRequestIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown-ip';
};

const getClientFingerprint = (req: Request): string => {
  const ip = getRequestIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown-agent';
  const hash = crypto
    .createHash('sha256')
    .update(`${ip}|${userAgent}`)
    .digest('hex')
    .slice(0, 16);
  return `client-${hash}`;
};

const createChatId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}${random}`.slice(0, 10);
};

const sessionKey = (chatId: string): string => `chat:session:${chatId}`;
const messagesKey = (chatId: string): string => `chat:messages:${chatId}`;

const getBaseUrl = (req: Request): string => {
  const host = req.get('host') || 'localhost:3000';
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = typeof forwardedProto === 'string' ? forwardedProto : req.protocol;
  return `${proto}://${host}`;
};

router.post('/create', async (req: Request, res: Response) => {
  try {
    await connectRedis();

    const chatId = createChatId();
    const createdBy = getClientFingerprint(req);
    const createdAt = new Date().toISOString();
    const session: ChatSession = { chatId, createdAt, createdBy };

    await redisClient.setEx(sessionKey(chatId), CHAT_EXPIRE_SECONDS, JSON.stringify(session));
    await redisClient.expire(messagesKey(chatId), CHAT_EXPIRE_SECONDS);

    const chatPath = `/chat/${chatId}`;
    res.json({
      success: true,
      chatId,
      chatPath,
      chatUrl: `${getBaseUrl(req)}${chatPath}`,
      clientId: createdBy,
    });
  } catch (error: unknown) {
    console.error('创建聊天失败:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: '创建聊天失败' });
  }
});

router.post('/:chatId/join', async (req: Request<{ chatId: string }>, res: Response) => {
  try {
    const { chatId } = req.params;
    await connectRedis();

    const exists = await redisClient.exists(sessionKey(chatId));
    if (!exists) {
      return res.status(404).json({ error: '聊天链接不存在或已过期' });
    }

    const clientId = getClientFingerprint(req);
    res.json({ success: true, chatId, clientId });
  } catch (error: unknown) {
    console.error('加入聊天失败:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: '加入聊天失败' });
  }
});

router.get('/:chatId/messages', async (req: Request<{ chatId: string }>, res: Response) => {
  try {
    const { chatId } = req.params;
    await connectRedis();

    const exists = await redisClient.exists(sessionKey(chatId));
    if (!exists) {
      return res.status(404).json({ error: '聊天链接不存在或已过期' });
    }

    const rawMessages = await redisClient.lRange(messagesKey(chatId), 0, -1);
    const messages: ChatMessage[] = rawMessages.map((item) => JSON.parse(item) as ChatMessage);
    res.json({ success: true, messages });
  } catch (error: unknown) {
    console.error('获取消息失败:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: '获取消息失败' });
  }
});

router.post('/:chatId/messages', async (req: Request<{ chatId: string }>, res: Response) => {
  try {
    const { chatId } = req.params;
    const { text, clientId } = req.body as { text?: string; clientId?: string };

    if (!text || !text.trim()) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    await connectRedis();
    const exists = await redisClient.exists(sessionKey(chatId));
    if (!exists) {
      return res.status(404).json({ error: '聊天链接不存在或已过期' });
    }

    const senderId = clientId && clientId.trim() ? clientId.trim() : getClientFingerprint(req);
    const senderName = senderId.slice(0, 12);

    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      chatId,
      senderId,
      senderName,
      text: text.trim().slice(0, 2000),
      createdAt: new Date().toISOString(),
    };

    await redisClient.rPush(messagesKey(chatId), JSON.stringify(message));
    await redisClient.lTrim(messagesKey(chatId), -MAX_MESSAGES, -1);
    await redisClient.expire(messagesKey(chatId), CHAT_EXPIRE_SECONDS);

    res.json({ success: true, message });
  } catch (error: unknown) {
    console.error('发送消息失败:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: '发送消息失败' });
  }
});

export default router;
