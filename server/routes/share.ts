import express from 'express';
import { redisClient, connectRedis } from '../redis';
import { setShareMemory, getShareMemory } from '../shareMemory';

const router = express.Router();

const PAYLOAD_TTL_SEC = 24 * 60 * 60;

function buildPayload(data: unknown) {
  return JSON.stringify({
    data,
    createdAt: new Date().toISOString(),
    type: 'json-formatter',
  });
}

// 存储分享数据，生成短链接（Redis 失败时降级为进程内内存）
router.post('/create', async (req, res) => {
  try {
    const { data } = req.body;

    if (data === undefined || data === null || data === '') {
      return res.status(400).json({ success: false, error: '缺少数据' });
    }

    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const shareId = (timestamp + random).substring(0, 8);

    const payload = buildPayload(data);

    try {
      await connectRedis();
      await redisClient.setEx(`share:${shareId}`, PAYLOAD_TTL_SEC, payload);
    } catch (redisErr: unknown) {
      const msg = redisErr instanceof Error ? redisErr.message : String(redisErr);
      console.warn('[share] Redis 不可用，改用内存存储（仅本进程有效）:', msg);
      setShareMemory(shareId, payload, PAYLOAD_TTL_SEC);
    }

    const protocol = process.env.HTTPS_ENABLED === 'true' ? 'https' : 'http';
    const domain = process.env.DOMAIN || 'localhost:3000';
    const shareUrl = `${protocol}://${domain}/share/${shareId}`;

    res.json({
      success: true,
      shareId,
      shareUrl,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (process.env.NODE_ENV === 'production') {
      console.error('创建分享失败:', err.message);
    } else {
      console.error('创建分享失败:', error);
      console.error('错误堆栈:', err.stack);
      console.error('请求体:', req.body);
    }
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      ...(process.env.NODE_ENV !== 'production' && { details: err.message }),
    });
  }
});

// 获取分享数据
router.get('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;

    if (!shareId) {
      return res.status(400).json({ success: false, error: '缺少分享ID' });
    }

    let shareData: string | null = null;
    try {
      await connectRedis();
      shareData = await redisClient.get(`share:${shareId}`);
    } catch (redisErr: unknown) {
      const msg = redisErr instanceof Error ? redisErr.message : String(redisErr);
      console.warn('[share] Redis 读取失败，尝试内存:', msg);
    }

    if (!shareData) {
      shareData = getShareMemory(shareId);
    }

    if (!shareData) {
      return res.status(404).json({ success: false, error: '分享链接已过期或不存在' });
    }

    const parsedData = JSON.parse(shareData);
    res.json({
      success: true,
      data: parsedData.data,
      createdAt: parsedData.createdAt,
      type: parsedData.type,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (process.env.NODE_ENV === 'production') {
      console.error('获取分享数据失败:', err.message);
    } else {
      console.error('获取分享数据失败:', error);
    }
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      ...(process.env.NODE_ENV !== 'production' && { details: err.message }),
    });
  }
});

export default router;