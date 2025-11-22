import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Tool {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
}

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

const tools: Tool[] = [
  { id: 'json', name: 'JSON', icon: '{ }', path: '/json-formatter', description: 'JSON格式化工具' },
  { id: 'base64', name: 'Base64', icon: '🔤', path: '/base64', description: 'Base64编解码器' },
  { id: 'regex', name: '正则', icon: '🔍', path: '/regex', description: '正则表达式测试' },
  { id: 'timestamp', name: '时间戳', icon: '🕐', path: '/timestamp', description: '时间戳转换器' },
  { id: 'url', name: 'URL', icon: '🔗', path: '/url', description: 'URL参数解析' },
  { id: 'markdown', name: 'Markdown', icon: '📝', path: '/markdown', description: 'Markdown编辑器' },
  { id: 'jwt', name: 'JWT', icon: '🔐', path: '/jwt', description: 'JWT Token解析' },
  { id: 'uuid', name: 'UUID', icon: '🆔', path: '/uuid', description: 'UUID生成器' },
  { id: 'color', name: '颜色', icon: '🎨', path: '/color', description: '颜色转换器' },
];

const JwtParser: React.FC = () => {
  const [jwtInput, setJwtInput] = useState<string>('');
  const [jwtData, setJwtData] = useState<JwtData | null>(null);
  const [error, setError] = useState<string>('');
  const [theme, setTheme] = useState<string>('vs-light');

  const themes = {
    'vs-dark': {
      name: 'VS Code Dark',
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      header: '#252526',
      border: '#3e3e42',
      button: '#1f6feb',
      string: '#ce9178',
      number: '#b5cea8',
      boolean: '#569cd6',
      key: '#9cdcfe',
      bracket: '#c586c0',
      comma: '#d4d4d4',
      placeholder: '#8b949e',
      buttonForeground: '#ffffff'
    },
    'github-dark': {
      name: 'GitHub Dark',
      background: '#0d1117',
      foreground: '#c9d1d9',
      header: '#161b22',
      border: '#30363d',
      button: '#238636',
      string: '#a5d6ff',
      number: '#79c0ff',
      boolean: '#ff7b72',
      key: '#7ee787',
      bracket: '#d2a8ff',
      comma: '#8b949e',
      placeholder: '#8b949e',
      buttonForeground: '#ffffff'
    },
    'monokai': {
      name: 'Monokai',
      background: '#272822',
      foreground: '#f8f8f2',
      header: '#3e3d32',
      border: '#75715e',
      button: '#66d9ef',
      string: '#e6db74',
      number: '#ae81ff',
      boolean: '#ae81ff',
      key: '#66d9ef',
      bracket: '#f92672',
      comma: '#75715e',
      placeholder: '#75715e',
      buttonForeground: '#000000'
    },
    'dracula': {
      name: 'Dracula',
      background: '#282a36',
      foreground: '#f8f8f2',
      header: '#44475a',
      border: '#6272a4',
      button: '#bd93f9',
      string: '#f1fa8c',
      number: '#50fa7b',
      boolean: '#ff79c6',
      key: '#8be9fd',
      bracket: '#ff79c6',
      comma: '#6272a4',
      placeholder: '#6272a4',
      buttonForeground: '#ffffff'
    },
    'solarized-dark': {
      name: 'Solarized Dark',
      background: '#002b36',
      foreground: '#839496',
      header: '#073642',
      border: '#657b83',
      button: '#268bd2',
      string: '#2aa198',
      number: '#2aa198',
      boolean: '#d33682',
      key: '#268bd2',
      bracket: '#859900',
      comma: '#657b83',
      placeholder: '#586e75',
      buttonForeground: '#ffffff'
    },
    'vs-light': {
      name: 'VS Code Light',
      background: '#ffffff',
      foreground: '#000000',
      header: '#f3f3f3',
      border: '#e1e1e1',
      button: '#0078d4',
      string: '#a31515',
      number: '#098658',
      boolean: '#0000ff',
      key: '#0451a5',
      bracket: '#000000',
      comma: '#000000',
      placeholder: '#6e6e6e',
      buttonForeground: '#ffffff'
    },
    'vs-high-contrast': {
      name: 'VS Code High Contrast',
      background: '#000000',
      foreground: '#ffffff',
      header: '#1a1a1a',
      border: '#ffffff',
      button: '#1a85ff',
      string: '#ce9178',
      number: '#b5cea8',
      boolean: '#569cd6',
      key: '#9cdcfe',
      bracket: '#ffd700',
      comma: '#ffffff',
      placeholder: '#ffffff',
      buttonForeground: '#000000'
    }
  };

  const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  const getThemeColors = (themeName: string) => {
    return themes[themeName as keyof typeof themes] || themes['vs-light'];
  };

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('json-formatter-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('json-formatter-theme', theme);
  }, [theme]);

  const renderNavigation = (): React.ReactNode => {
    return (
      <div style={{
        backgroundColor: getThemeColors(theme).header,
        borderBottom: `1px solid ${getThemeColors(theme).border}`,
        padding: '8px 0',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            gap: '16px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginRight: '16px',
              paddingRight: '16px',
              borderRight: `1px solid ${getThemeColors(theme).border}`,
            }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: getThemeColors(theme).button }}>
                🔧
              </span>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: getThemeColors(theme).foreground 
              }}>
                DevTools
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '4px',
              alignItems: 'center',
              overflow: 'auto',
              flex: 1,
            }}>
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => navigate(tool.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    backgroundColor: location.pathname === tool.path 
                      ? getThemeColors(theme).button 
                      : 'transparent',
                    color: location.pathname === tool.path 
                      ? (getThemeColors(theme).buttonForeground || getThemeColors(theme).foreground)
                      : getThemeColors(theme).placeholder,
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                  title={tool.description}
                >
                  <span style={{ fontSize: '14px' }}>{tool.icon}</span>
                  <span>{tool.name}</span>
                </button>
              ))}
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: '11px',
                  color: getThemeColors(theme).placeholder,
                  marginRight: '4px',
                }}>
                  主题:
                </span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  style={{
                    backgroundColor: getThemeColors(theme).background,
                    color: getThemeColors(theme).foreground,
                    border: `1px solid ${getThemeColors(theme).border}`,
                    padding: '4px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {Object.entries(themes).map(([key, themeConfig]) => (
                    <option key={key} value={key}>
                      {themeConfig.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      {renderNavigation()}
      
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