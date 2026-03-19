import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';
import { API_ENDPOINTS } from '../../config/api';

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
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

  const storageKey = useMemo(() => `chat-client-id:${chatId || 'unknown'}`, [chatId]);

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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: currentTheme.background,
        color: currentTheme.foreground,
      }}
    >
      <ToolNavigation currentTheme={currentTheme} />

      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${currentTheme.border}`,
          backgroundColor: currentTheme.header,
        }}
      >
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 500 }}>简约聊天</h1>
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#666' }}>
          会话ID: {chatId || 'unknown'} | 客户标识: {clientId || '连接中...'}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {loading && <div>正在连接聊天...</div>}
        {!loading && messages.length === 0 && !error && <div>暂无消息，发送第一条消息吧。</div>}
        {messages.map((msg) => {
          const isMine = msg.senderId === clientId;
          return (
            <div
              key={msg.id}
              style={{
                maxWidth: '70%',
                marginBottom: '10px',
                marginLeft: isMine ? 'auto' : 0,
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: isMine ? '#dbeafe' : '#f3f4f6',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                {msg.senderName} · {new Date(msg.createdAt).toLocaleString()}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '12px 16px', borderTop: `1px solid ${currentTheme.border}` }}>
        {error && (
          <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '8px' }}>{error}</div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void sendMessage();
              }
            }}
            placeholder="输入消息..."
            style={{
              flex: 1,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              padding: '10px 12px',
              outline: 'none',
              fontSize: '14px',
            }}
          />
          <button
            onClick={() => {
              void sendMessage();
            }}
            disabled={sending || !input.trim()}
            style={{
              border: 'none',
              borderRadius: '6px',
              padding: '0 16px',
              backgroundColor: sending || !input.trim() ? '#9ca3af' : '#2563eb',
              color: '#fff',
              cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {sending ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleChatPage;
