import React, { useState, useEffect } from 'react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';

interface UuidInfo {
  uuid: string;
  timestamp: number;
  version: string;
  variant: string;
}


const UuidGenerator: React.FC = () => {
  const [uuids, setUuids] = useState<UuidInfo[]>([]);
  const [amount, setAmount] = useState<number>(1);
  const [version, setVersion] = useState<string>('v4');
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [withDashes, setWithDashes] = useState<boolean>(true);
  const [theme, setTheme] = useState<string>('vs-light');



  useEffect(() => {
    const savedTheme = localStorage.getItem('json-formatter-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('json-formatter-theme', theme);
  }, [theme]);


  const generateUuid = (): string => {
    let uuid: string;
    
    if (version === 'v4') {
      // UUID v4 - 随机
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } else {
      // UUID v1 - 基于时间戳
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 0xFFFFFF);
      uuid = 'xxxxxxxx-xxxx-1xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        if (c === 'x') {
          const r = Math.floor(Math.random() * 16);
          return r.toString(16);
        } else {
          const r = Math.floor(Math.random() * 16);
          const v = r & 0x3 | 0x8;
          return v.toString(16);
        }
      });
    }

    if (uppercase) {
      uuid = uuid.toUpperCase();
    }

    if (!withDashes) {
      uuid = uuid.replace(/-/g, '');
    }

    return uuid;
  };

  const generateMultipleUuids = () => {
    const newUuids: UuidInfo[] = [];
    for (let i = 0; i < amount; i++) {
      const uuid = generateUuid();
      newUuids.push({
        uuid,
        timestamp: Date.now() + i,
        version: version,
        variant: 'RFC 4122'
      });
    }
    setUuids(newUuids);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllUuids = () => {
    const allUuids = uuids.map(info => info.uuid).join('\n');
    navigator.clipboard.writeText(allUuids);
  };

  const clearAll = () => {
    setUuids([]);
  };

  const currentTheme = getThemeColors(theme);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: currentTheme.background,
      color: currentTheme.foreground,
      fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
    }}>
      <ToolNavigation 
        theme={theme}
        setTheme={setTheme}
        currentTheme={currentTheme}
      />
      
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${currentTheme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: currentTheme.header,
      }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'normal' }}>
          🆔 UUID生成器
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={clearAll}
            disabled={uuids.length === 0}
            style={{
              backgroundColor: uuids.length > 0 ? currentTheme.border : currentTheme.header,
              color: currentTheme.foreground,
              border: `1px solid ${currentTheme.border}`,
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: uuids.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px',
            }}
          >
            清空
          </button>
        </div>
      </div>

      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${currentTheme.border}`,
        backgroundColor: currentTheme.header,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '16px',
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              数量
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              style={{
                width: '100%',
                padding: '6px',
                backgroundColor: currentTheme.background,
                color: currentTheme.foreground,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              版本
            </label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                backgroundColor: currentTheme.background,
                color: currentTheme.foreground,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="v4">Version 4 (随机)</option>
              <option value="v1">Version 1 (时间戳)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              选项
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => setUppercase(e.target.checked)}
                />
                <span style={{ fontSize: '12px' }}>大写</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={withDashes}
                  onChange={(e) => setWithDashes(e.target.checked)}
                />
                <span style={{ fontSize: '12px' }}>包含横线</span>
              </label>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
        }}>
          <button
            onClick={generateMultipleUuids}
            style={{
              backgroundColor: currentTheme.button,
              color: currentTheme.buttonForeground || currentTheme.foreground,
              border: `1px solid ${currentTheme.border}`,
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            生成UUID
          </button>
          <button
            onClick={copyAllUuids}
            disabled={uuids.length === 0}
            style={{
              backgroundColor: uuids.length > 0 ? currentTheme.button : currentTheme.border,
              color: currentTheme.buttonForeground || currentTheme.foreground,
              border: `1px solid ${currentTheme.border}`,
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: uuids.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px',
            }}
          >
            复制全部
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        padding: '16px',
        overflow: 'auto',
      }}>
        {uuids.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '12px',
          }}>
            {uuids.map((info, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  backgroundColor: currentTheme.background,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '8px',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px',
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: currentTheme.placeholder,
                  }}>
                    #{index + 1}
                  </span>
                  <button
                    onClick={() => copyToClipboard(info.uuid)}
                    style={{
                      backgroundColor: currentTheme.button,
                      color: currentTheme.buttonForeground || currentTheme.foreground,
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    复制
                  </button>
                </div>
                <div style={{
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  color: currentTheme.string,
                  marginBottom: '8px',
                  wordBreak: 'break-all',
                  padding: '8px',
                  backgroundColor: currentTheme.header,
                  borderRadius: '4px',
                }}>
                  {info.uuid}
                </div>
                <div style={{ fontSize: '11px', color: currentTheme.placeholder }}>
                  <div>版本: {info.version}</div>
                  <div>变体: {info.variant}</div>
                  <div>生成时间: {new Date(info.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            color: currentTheme.placeholder,
            fontSize: '14px',
            padding: '16px',
          }}>
            配置选项并点击"生成UUID"
          </div>
        )}
      </div>
    </div>
  );
};

export default UuidGenerator;