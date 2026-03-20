import React, { useState } from 'react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';

const SALT_LEN = 16;
const IV_LEN = 12;
const PBKDF2_ITER = 100000;

function toB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 1) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i += 1) out[i] = s.charCodeAt(i);
  return out;
}

async function deriveAesKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITER, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptText(plain: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveAesKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plain));
  const ct = new Uint8Array(ciphertext);
  const combined = new Uint8Array(SALT_LEN + IV_LEN + ct.length);
  combined.set(salt, 0);
  combined.set(iv, SALT_LEN);
  combined.set(ct, SALT_LEN + IV_LEN);
  return toB64(combined.buffer);
}

async function decryptText(b64: string, password: string): Promise<string> {
  const combined = fromB64(b64.trim());
  if (combined.length < SALT_LEN + IV_LEN + 16) {
    throw new Error('密文格式无效或过短');
  }
  const salt = combined.slice(0, SALT_LEN);
  const iv = combined.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const ct = combined.slice(SALT_LEN + IV_LEN);
  const key = await deriveAesKey(password, salt);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(plainBuf);
}

const EncryptTool: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [plain, setPlain] = useState<string>('');
  const [cipherB64, setCipherB64] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const currentTheme = getThemeColors('vs-light');

  const handleEncrypt = async (): Promise<void> => {
    if (!password) {
      alert('请输入密码');
      return;
    }
    setBusy(true);
    try {
      const out = await encryptText(plain, password);
      setCipherB64(out);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '加密失败');
    } finally {
      setBusy(false);
    }
  };

  const handleDecrypt = async (): Promise<void> => {
    if (!password) {
      alert('请输入密码');
      return;
    }
    if (!cipherB64.trim()) {
      alert('请输入密文（Base64）');
      return;
    }
    setBusy(true);
    try {
      const out = await decryptText(cipherB64, password);
      setPlain(out);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '解密失败');
    } finally {
      setBusy(false);
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
        fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
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
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 500 }}>🔒 简易加密（AES-GCM）</h1>
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#666' }}>
          密码经 PBKDF2 派生密钥，仅本地浏览器计算，请勿用于高安全场景。
        </p>
      </div>
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ marginBottom: '4px', fontSize: '13px' }}>密码</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '8px 10px',
              borderRadius: '6px',
              border: `1px solid ${currentTheme.border}`,
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div>
          <div style={{ marginBottom: '4px', fontSize: '13px' }}>明文</div>
          <textarea
            value={plain}
            onChange={(e) => setPlain(e.target.value)}
            placeholder="要加密的文本"
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '10px',
              borderRadius: '6px',
              border: `1px solid ${currentTheme.border}`,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              void handleEncrypt();
            }}
            disabled={busy}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: busy ? '#9ca3af' : '#2563eb',
              color: '#fff',
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            加密 → 密文
          </button>
          <button
            type="button"
            onClick={() => {
              void handleDecrypt();
            }}
            disabled={busy}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: busy ? '#9ca3af' : '#059669',
              color: '#fff',
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            解密 ← 密文
          </button>
        </div>
        <div>
          <div style={{ marginBottom: '4px', fontSize: '13px' }}>密文（Base64，含盐与 IV）</div>
          <textarea
            value={cipherB64}
            onChange={(e) => setCipherB64(e.target.value)}
            placeholder="加密结果或粘贴密文后点「解密」"
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '10px',
              borderRadius: '6px',
              border: `1px solid ${currentTheme.border}`,
              fontFamily: 'inherit',
              fontSize: '12px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EncryptTool;
