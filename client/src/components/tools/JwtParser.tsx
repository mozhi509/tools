import React, { useState } from 'react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';

interface JwtHeader {
  [key: string]: any;
}

interface JwtPayload {
  [key: string]: any;
}

interface JwtData {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  valid: boolean;
}

const JwtParser: React.FC = () => {
  const [jwtInput, setJwtInput] = useState<string>('');
  const [jwtData, setJwtData] = useState<JwtData | null>(null);
  const [error, setError] = useState<string>('');


  const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';





  const parseJwt = (token: string): JwtData | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('JWT token must have 3 parts');
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const signature = parts[2];

      return {
        header,
        payload,
        signature,
        valid: true
      };
    } catch (error) {
      return null;
    }
  };

  const analyzeJwt = () => {
    if (!jwtInput.trim()) {
      setError('');
      setJwtData(null);
      return;
    }

    const data = parseJwt(jwtInput.trim());
    if (data) {
      setJwtData(data);
      setError('');
    } else {
      setJwtData(null);
      setError('无效的JWT token格式');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setJwtInput('');
    setJwtData(null);
    setError('');
  };

  const useSampleJwt = () => {
    setJwtInput(sampleJwt);
    analyzeJwt();
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (Array.isArray(value)) {
      return `[${value.map(v => formatValue(v)).join(', ')}]`;
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const currentTheme = getThemeColors('vs-light');

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
          🔐 JWT Token解析器
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={clearAll}
            style={{
              backgroundColor: currentTheme.border,
              color: currentTheme.foreground,
              border: `1px solid ${currentTheme.border}`,
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
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
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <span style={{ fontSize: '14px', color: currentTheme.foreground }}>示例:</span>
          <button
            onClick={useSampleJwt}
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.key,
              border: `1px solid ${currentTheme.border}`,
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.button;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.background;
            }}
          >
            使用示例JWT
          </button>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
        }}>
          <textarea
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
            placeholder="粘贴JWT token (格式: header.payload.signature)"
            style={{
              flex: 1,
              height: '80px',
              padding: '8px',
              backgroundColor: currentTheme.background,
              color: currentTheme.foreground,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace',
              resize: 'vertical',
            }}
          />
          <button
            onClick={analyzeJwt}
            disabled={!jwtInput.trim()}
            style={{
              backgroundColor: jwtInput.trim() ? currentTheme.button : currentTheme.border,
              color: currentTheme.buttonForeground || currentTheme.foreground,
              border: `1px solid ${currentTheme.border}`,
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: jwtInput.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
            }}
          >
            解析
          </button>
        </div>
        {error && (
          <div style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: '4px',
            color: '#c62828',
            fontSize: '12px',
          }}>
            {error}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        flex: 1,
        padding: '16px',
        gap: '16px',
        overflow: 'hidden',
      }}>
        {jwtData ? (
          <>
            {/* Header */}
            <div style={{
              flex: 1,
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: currentTheme.header,
                borderBottom: `1px solid ${currentTheme.border}`,
              }}>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(jwtData.header, null, 2))}
                    style={{
                      backgroundColor: currentTheme.button,
                      color: currentTheme.buttonForeground || currentTheme.foreground,
                      border: `1px solid ${currentTheme.border}`,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    复制Header
                  </button>
                </div>
              </div>
              <div style={{
                padding: '16px',
                overflow: 'auto',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Header</div>
                {Object.entries(jwtData.header).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '8px' }}>
                    <span style={{ color: currentTheme.key, fontSize: '12px' }}>{key}:</span>
                    <span style={{ 
                      color: currentTheme.string, 
                      marginLeft: '8px',
                      fontSize: '12px' 
                    }}>
                      {formatValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payload */}
            <div style={{
              flex: 1,
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: currentTheme.header,
                borderBottom: `1px solid ${currentTheme.border}`,
              }}>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(jwtData.payload, null, 2))}
                    style={{
                      backgroundColor: currentTheme.button,
                      color: currentTheme.buttonForeground || currentTheme.foreground,
                      border: `1px solid ${currentTheme.border}`,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    复制Payload
                  </button>
                </div>
              </div>
              <div style={{
                padding: '16px',
                overflow: 'auto',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Payload</div>
                {Object.entries(jwtData.payload).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '8px' }}>
                    <span style={{ color: currentTheme.key, fontSize: '12px' }}>{key}:</span>
                    <span style={{ 
                      color: typeof value === 'string' ? currentTheme.string : currentTheme.number, 
                      marginLeft: '8px',
                      fontSize: '12px' 
                    }}>
                      {formatValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature */}
            <div style={{
              flex: 1,
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: currentTheme.header,
                borderBottom: `1px solid ${currentTheme.border}`,
              }}>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}>
                  <button
                    onClick={() => copyToClipboard(jwtData.signature)}
                    style={{
                      backgroundColor: currentTheme.button,
                      color: currentTheme.buttonForeground || currentTheme.foreground,
                      border: `1px solid ${currentTheme.border}`,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    复制Signature
                  </button>
                </div>
              </div>
              <div style={{
                padding: '16px',
                overflow: 'auto',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Signature</div>
                <div style={{
                  padding: '8px',
                  backgroundColor: currentTheme.header,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '4px',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: currentTheme.placeholder,
                }}>
                  {jwtData.signature}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            color: currentTheme.placeholder,
            fontSize: '14px',
            padding: '16px',
          }}>
            输入JWT token进行解析
          </div>
        )}
      </div>
    </div>
  );
};

export default JwtParser;