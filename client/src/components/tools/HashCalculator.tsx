import React, { useState } from 'react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';

type HashAlg = 'SHA-256' | 'SHA-384' | 'SHA-512';

const HashCalculator: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [algorithm, setAlgorithm] = useState<HashAlg>('SHA-256');
  const [busy, setBusy] = useState<boolean>(false);
  const currentTheme = getThemeColors('vs-light');

  const digestHex = async (alg: HashAlg, text: string): Promise<string> => {
    const buf = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest(alg, buf);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const compute = async (): Promise<void> => {
    if (!input.trim()) {
      setOutput('');
      return;
    }
    setBusy(true);
    try {
      const hex = await digestHex(algorithm, input);
      setOutput(hex);
    } catch (error: unknown) {
      setOutput(error instanceof Error ? error.message : '计算失败');
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
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 500 }}># 哈希（SHA）</h1>
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#666' }}>
          使用浏览器 Web Crypto 计算文本的 SHA-256 / SHA-384 / SHA-512（十六进制）。
        </p>
      </div>
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '14px' }}>算法：</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as HashAlg)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: `1px solid ${currentTheme.border}`,
              background: currentTheme.background,
              color: currentTheme.foreground,
            }}
          >
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-384">SHA-384</option>
            <option value="SHA-512">SHA-512</option>
          </select>
          <button
            type="button"
            onClick={() => {
              void compute();
            }}
            disabled={busy}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              background: busy ? '#9ca3af' : '#2563eb',
              color: '#fff',
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? '计算中…' : '计算哈希'}
          </button>
        </div>
        <div>
          <div style={{ marginBottom: '6px', fontSize: '13px' }}>输入文本</div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入要哈希的文本"
            style={{
              width: '100%',
              minHeight: '160px',
              padding: '10px',
              borderRadius: '6px',
              border: `1px solid ${currentTheme.border}`,
              fontFamily: 'inherit',
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div>
          <div style={{ marginBottom: '6px', fontSize: '13px' }}>十六进制结果</div>
          <textarea
            value={output}
            readOnly
            placeholder="哈希结果"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '10px',
              borderRadius: '6px',
              border: `1px solid ${currentTheme.border}`,
              background: '#f9fafb',
              fontFamily: 'inherit',
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HashCalculator;
