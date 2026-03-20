import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';
import { API_ENDPOINTS } from '../../config/api';

/** Messenger 风格色板（参考 Facebook / Messenger 常见配色） */
const FB = {
  pageBg: '#f0f2f5',
  headerBg: '#ffffff',
  sentBubble: '#0084ff',
  sentText: '#ffffff',
  recvBubble: '#ffffff',
  recvText: '#050505',
  meta: '#65676b',
  border: '#e4e6eb',
  inputBg: '#f0f2f5',
  shadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  headerShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
};

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

function avatarInitials(name: string): string {
  const t = name.trim();
  if (!t) return '?';
  return t.length <= 2 ? t.toUpperCase() : t.slice(0, 2).toUpperCase();
}

function avatarHue(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h + name.charCodeAt(i) * 17) % 360;
  }
  return `hsl(${h}, 55%, 48%)`;
}

function formatMsgTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) {
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

const SimpleChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const currentTheme = getThemeColors('vs-light');
  const [clientId, setClientId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const storageKey = useMemo(() => `chat-client-id:${chatId || 'unknown'}`, [chatId]);

  const shortChatId = useMemo(() => {
    if (!chatId) return '—';
    return chatId.length > 12 ? `${chatId.slice(0, 6)}…${chatId.slice(-4)}` : chatId;
  }, [chatId]);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      const res = await fetch(API_ENDPOINTS.chat.messages(chatId));
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '加载消息失败');
      }
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setError('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '加载消息失败';
      setError(message);
    }
  }, [chatId]);

  useEffect(() => {
    const joinChat = async () => {
      if (!chatId) {
        setError('无效的聊天链接');
        setLoading(false);
        return;
      }

      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          setClientId(cached);
        }

        const res = await fetch(API_ENDPOINTS.chat.join(chatId), { method: 'POST' });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || '加入聊天失败');
        }

        const nextClientId = data.clientId as string;
        setClientId(nextClientId);
        localStorage.setItem(storageKey, nextClientId);
        await loadMessages();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '加入聊天失败';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    joinChat();
  }, [chatId, loadMessages, storageKey]);

  useEffect(() => {
    if (!chatId) return;
    const timer = window.setInterval(() => {
      loadMessages();
    }, 3000);

    return () => {
      window.clearInterval(timer);
    };
  }, [chatId, loadMessages]);

  useEffect(() => {
    try {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      /* jsdom 等环境可能未完整实现 */
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!chatId || !input.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(API_ENDPOINTS.chat.messages(chatId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: input.trim(),
          clientId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '发送失败');
      }

      setInput('');
      await loadMessages();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '发送失败';
      setError(message);
    } finally {
      setSending(false);
    }
  };

  const font =
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  return (
    <>
    <style>{`
      @keyframes simpleChatSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `}</style>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: FB.pageBg,
        color: FB.recvText,
        fontFamily: font,
      }}
    >
      <ToolNavigation currentTheme={currentTheme} />

      {/* Messenger 风格主区域 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          margin: '0 auto',
          width: '100%',
          maxWidth: 920,
        }}
      >
        {/* 顶栏：白底 + 轻阴影 */}
        <header
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: FB.headerBg,
            boxShadow: FB.headerShadow,
            borderBottom: `1px solid ${FB.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0084ff 0%, #0064d1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
                fontWeight: 600,
              }}
              aria-hidden
            >
              💬
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#050505' }}>聊天</h1>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: FB.meta }}>
                {loading ? '正在连接…' : `会话 ${shortChatId}`}
                {!loading && clientId && (
                  <span style={{ marginLeft: 8, opacity: 0.85 }}>· 你已加入</span>
                )}
              </p>
            </div>
          </div>
        </header>

        {/* 消息列表 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '16px 12px 8px',
            backgroundColor: FB.pageBg,
          }}
        >
          {loading && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '48px 16px',
                color: FB.meta,
                fontSize: 15,
              }}
            >
              <Loader2 size={28} style={{ animation: 'simpleChatSpin 0.8s linear infinite' }} />
              <span>正在连接聊天…</span>
            </div>
          )}

          {!loading && messages.length === 0 && !error && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: FB.meta,
                fontSize: 15,
                lineHeight: 1.5,
              }}
            >
              暂无消息
              <br />
              <span style={{ fontSize: 13 }}>在下方输入框发送第一条消息</span>
            </div>
          )}

          {!loading &&
            messages.map((msg) => {
              const isMine = msg.senderId === clientId;
              const showAvatar = !isMine;

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-end',
                    gap: 8,
                    marginBottom: 10,
                    paddingLeft: showAvatar ? 0 : 0,
                    paddingRight: isMine ? 0 : 0,
                  }}
                >
                  {showAvatar && (
                    <div
                      title={msg.senderName}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: avatarHue(msg.senderName),
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: FB.shadow,
                      }}
                    >
                      {avatarInitials(msg.senderName)}
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: 'min(75%, 420px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMine ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {!isMine && (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: FB.meta,
                          marginBottom: 4,
                          paddingLeft: 2,
                        }}
                      >
                        {msg.senderName}
                      </span>
                    )}
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 18,
                        backgroundColor: isMine ? FB.sentBubble : FB.recvBubble,
                        color: isMine ? FB.sentText : FB.recvText,
                        boxShadow: isMine ? 'none' : FB.shadow,
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        fontSize: 15,
                        lineHeight: 1.4,
                      }}
                    >
                      {msg.text}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: FB.meta,
                        marginTop: 4,
                        paddingLeft: isMine ? 0 : 4,
                        paddingRight: isMine ? 4 : 0,
                      }}
                    >
                      {formatMsgTime(msg.createdAt)}
                    </span>
                  </div>

                  {isMine && (
                    <div
                      title="你"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: FB.sentBubble,
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      我
                    </div>
                  )}
                </div>
              );
            })}

          <div ref={bottomRef} />
        </div>

        {/* 底部输入区 */}
        <div
          style={{
            flexShrink: 0,
            padding: '10px 12px 14px',
            backgroundColor: FB.headerBg,
            borderTop: `1px solid ${FB.border}`,
            boxShadow: '0 -1px 0 rgba(0,0,0,0.04)',
          }}
        >
          {error && (
            <div
              role="alert"
              style={{
                backgroundColor: '#ffebe9',
                color: '#c00',
                fontSize: 13,
                padding: '8px 12px',
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              {error}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: FB.inputBg,
              borderRadius: 22,
              padding: '4px 6px 4px 14px',
              border: `1px solid ${FB.border}`,
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Aa"
              rows={1}
              disabled={loading || !clientId}
              aria-label="消息内容"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 15,
                padding: '10px 0',
                fontFamily: font,
                color: '#050505',
                resize: 'none',
                minHeight: 24,
                maxHeight: 120,
                lineHeight: 1.45,
              }}
            />
            <button
              type="button"
              onClick={() => {
                void sendMessage();
              }}
              disabled={sending || !input.trim() || loading || !clientId}
              aria-label="发送"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  sending || !input.trim() || loading || !clientId ? '#ccd0d5' : FB.sentBubble,
                color: '#fff',
                cursor:
                  sending || !input.trim() || loading || !clientId ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              {sending ? (
                <Loader2 size={20} style={{ animation: 'simpleChatSpin 0.8s linear infinite' }} />
              ) : (
                <Send size={20} strokeWidth={2.2} />
              )}
            </button>
          </div>
          <p style={{ margin: '8px 4px 0', fontSize: 11, color: FB.meta, textAlign: 'center' }}>
            Enter 发送 · Shift+Enter 换行
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default SimpleChatPage;
