import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Tool {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
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

const TimestampConverter: React.FC = () => {
  const [timestamp, setTimestamp] = useState<string>('');
  const [datetime, setDatetime] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [conversions, setConversions] = useState<any[]>([]);
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

  const commonTimestamps = [
    { name: '当前时间', value: Date.now() },
    { name: '今天开始', value: new Date().setHours(0, 0, 0, 0) },
    { name: '今天结束', value: new Date().setHours(23, 59, 59, 999) },
    { name: '昨天开始', value: new Date(Date.now() - 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0) },
    { name: '明天开始', value: new Date(Date.now() + 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0) },
    { name: '本周开始', value: new Date(Date.now() - (new Date().getDay() || 7) * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0) },
    { name: '本月开始', value: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() },
    { name: '今年开始', value: new Date(new Date().getFullYear(), 0, 1).getTime() },
  ];

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const timestampToDate = (ts: string): Date => {
    const num = parseInt(ts, 10);
    if (isNaN(num)) return new Date();
    if (ts.length === 10) {
      return new Date(num * 1000);
    } else {
      return new Date(num);
    }
  };

  const dateToTimestamp = (dateStr: string): number => {
    return new Date(dateStr).getTime();
  };

  const formatTimestamps = (date: Date): any => {
    return {
      'Unix时间戳(秒)': Math.floor(date.getTime() / 1000),
      'Unix时间戳(毫秒)': date.getTime(),
      'ISO 8601': date.toISOString(),
      '本地时间': date.toLocaleString(),
      'UTC时间': date.toUTCString(),
      '时区': Intl.DateTimeFormat().resolvedOptions().timeZone,
      '星期': ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
    };
  };

  const convertTimestamp = () => {
    if (!timestamp.trim()) return;
    
    try {
      const date = timestampToDate(timestamp);
      const formats = formatTimestamps(date);
      setConversions([formats]);
      setDatetime(date.toISOString().slice(0, 16));
    } catch (error) {
      setConversions([{
        '错误': '时间戳格式不正确'
      }]);
    }
  };

  const convertDatetime = () => {
    if (!datetime) return;
    
    try {
      const ts = dateToTimestamp(datetime);
      const date = new Date(ts);
      const formats = formatTimestamps(date);
      setConversions([formats]);
      setTimestamp(Math.floor(ts / 1000).toString());
    } catch (error) {
      setConversions([{
        '错误': '日期时间格式不正确'
      }]);
    }
  };

  const clearAll = () => {
    setTimestamp('');
    setDatetime('');
    setConversions([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleQuickTime = (ts: number) => {
    setTimestamp(Math.floor(ts / 1000).toString());
    const date = new Date(ts);
    setDatetime(date.toISOString().slice(0, 16));
    const formats = formatTimestamps(date);
    setConversions([formats]);
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
          🕐 时间戳转换器
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            fontSize: '14px',
            color: currentTheme.placeholder,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>当前时间:</span>
            <span style={{ color: currentTheme.foreground, fontFamily: 'monospace' }}>
              {currentTime.toLocaleString()}
            </span>
            <span style={{ 
              fontSize: '12px',
              color: currentTheme.number,
              fontFamily: 'monospace' 
            }}>
              ({Math.floor(currentTime.getTime() / 1000)})
            </span>
          </div>
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
        display: 'flex',
        flex: 1,
        padding: '16px',
        gap: '16px',
        overflow: 'hidden',
      }}>
        {/* 左侧输入区域 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* 时间戳转日期 */}
          <div style={{
            backgroundColor: currentTheme.background,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: currentTheme.header,
              borderBottom: `1px solid ${currentTheme.border}`,
              fontSize: '14px',
              fontWeight: 'bold',
            }}>
              时间戳 → 日期时间
            </div>
            <div style={{
              padding: '12px',
              display: 'flex',
              gap: '8px',
            }}>
              <input
                type="number"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                placeholder="输入时间戳 (秒或毫秒)..."
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: currentTheme.background,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                }}
              />
              <button
                onClick={convertTimestamp}
                disabled={!timestamp.trim()}
                style={{
                  backgroundColor: timestamp.trim() ? currentTheme.button : currentTheme.border,
                  color: currentTheme.buttonForeground || currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: timestamp.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                }}
              >
                转换
              </button>
            </div>
          </div>

          {/* 日期转时间戳 */}
          <div style={{
            backgroundColor: currentTheme.background,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: currentTheme.header,
              borderBottom: `1px solid ${currentTheme.border}`,
              fontSize: '14px',
              fontWeight: 'bold',
            }}>
              日期时间 → 时间戳
            </div>
            <div style={{
              padding: '12px',
              display: 'flex',
              gap: '8px',
            }}>
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: currentTheme.background,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                }}
              />
              <button
                onClick={convertDatetime}
                disabled={!datetime}
                style={{
                  backgroundColor: datetime ? currentTheme.button : currentTheme.border,
                  color: currentTheme.buttonForeground || currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: datetime ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                }}
              >
                转换
              </button>
            </div>
          </div>

          {/* 快速选择 */}
          <div style={{
            backgroundColor: currentTheme.background,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: currentTheme.header,
              borderBottom: `1px solid ${currentTheme.border}`,
              fontSize: '14px',
              fontWeight: 'bold',
            }}>
              快速选择
            </div>
            <div style={{
              padding: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '4px',
            }}>
              {commonTimestamps.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleQuickTime(item.value)}
                  style={{
                    padding: '8px',
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'left',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = currentTheme.header;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = currentTheme.background;
                  }}
                >
                  <div style={{ color: currentTheme.key, fontSize: '11px', fontWeight: 'bold' }}>
                    {item.name}
                  </div>
                  <div style={{ 
                    color: currentTheme.placeholder, 
                    fontSize: '9px',
                    fontFamily: 'monospace',
                  }}>
                    {Math.floor(item.value / 1000)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧结果区域 */}
        <div style={{
          flex: 1,
          backgroundColor: currentTheme.background,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: currentTheme.header,
            borderBottom: `1px solid ${currentTheme.border}`,
            fontSize: '14px',
            fontWeight: 'bold',
          }}>
            转换结果
          </div>
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '12px',
          }}>
            {conversions.length > 0 ? (
              conversions.map((conversion, index) => (
                <div key={index}>
                  {Object.entries(conversion).map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        padding: '8px',
                        marginBottom: '8px',
                        backgroundColor: currentTheme.header,
                        border: `1px solid ${currentTheme.border}`,
                      borderRadius: '4px',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ color: currentTheme.key, fontSize: '12px' }}>
                          {key}
                        </span>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <span style={{ 
                            color: currentTheme.foreground,
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            wordBreak: 'break-all',
                            flex: 1,
                          }}>
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(String(value))}
                            style={{
                              backgroundColor: currentTheme.button,
                              color: currentTheme.buttonForeground || currentTheme.foreground,
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              flexShrink: 0,
                            }}
                          >
                            复制
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: currentTheme.placeholder,
                fontSize: '14px',
              }}>
                输入时间戳或日期时间进行转换
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimestampConverter;