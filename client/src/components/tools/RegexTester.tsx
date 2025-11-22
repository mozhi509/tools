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

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState<string>('');
  const [flags, setFlags] = useState<string>('g');
  const [testText, setTestText] = useState<string>('');
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
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

  const commonPatterns = [
    { name: '邮箱', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
    { name: '手机号', pattern: '^1[3-9]\\d{9}$' },
    { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
    { name: 'IP地址', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$' },
    { name: '身份证', pattern: '^\\d{15}|\\d{18}|\\d{17}[Xx]$' },
    { name: '中文', pattern: '[\\u4e00-\\u9fa5]+' },
    { name: '数字', pattern: '\\d+' },
    { name: '字母', pattern: '[a-zA-Z]+' },
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

  const testRegex = () => {
    if (!pattern) {
      setError('请输入正则表达式');
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches: RegExpMatchArray[] = [];
      let match;
      
      if (flags.includes('g')) {
        while ((match = regex.exec(testText)) !== null) {
          matches.push({ ...match });
        }
      } else {
        match = testText.match(regex);
        if (match) {
          matches.push(match);
        }
      }
      
      setMatches(matches);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '正则表达式错误');
      setMatches([]);
    }
  };

  const clearAll = () => {
    setPattern('');
    setFlags('g');
    setTestText('');
    setMatches([]);
    setError('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
          🔍 正则表达式测试器
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
          {/* 正则表达式输入 */}
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              正则表达式
              <div style={{
                display: 'flex',
                gap: '4px',
                marginLeft: 'auto',
              }}>
                {['g', 'i', 'm', 's', 'u', 'y'].map(flag => (
                  <label key={flag} style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={flags.includes(flag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFlags(flags + flag);
                        } else {
                          setFlags(flags.replace(flag, ''));
                        }
                      }}
                    />
                    <span style={{ fontSize: '12px' }}>{flag}</span>
                  </label>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="输入正则表达式..."
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: currentTheme.background,
                color: currentTheme.foreground,
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              }}
            />
            <div style={{
              padding: '8px 12px',
              backgroundColor: currentTheme.header,
              borderTop: `1px solid ${currentTheme.border}`,
              display: 'flex',
              gap: '8px',
            }}>
              <button
                onClick={testRegex}
                disabled={!pattern || !testText}
                style={{
                  backgroundColor: pattern && testText ? currentTheme.button : currentTheme.border,
                  color: currentTheme.buttonForeground || currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: pattern && testText ? 'pointer' : 'not-allowed',
                  fontSize: '12px',
                }}
              >
                测试
              </button>
              <button
                onClick={() => copyToClipboard(pattern)}
                disabled={!pattern}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.buttonForeground || currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: pattern ? 'pointer' : 'not-allowed',
                  fontSize: '12px',
                }}
              >
                复制
              </button>
            </div>
          </div>

          {/* 测试文本 */}
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
            }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => copyToClipboard(testText)}
                  disabled={!testText.trim()}
                  style={{
                    backgroundColor: testText.trim() ? currentTheme.button : currentTheme.border,
                    color: currentTheme.buttonForeground || currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: testText.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '11px',
                    transition: 'background-color 0.2s',
                  }}
                >
                  复制
                </button>
                <button
                  onClick={() => setTestText('')}
                  disabled={!testText.trim()}
                  style={{
                    backgroundColor: currentTheme.border,
                    color: currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: testText.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '11px',
                    transition: 'background-color 0.2s',
                  }}
                >
                  清空
                </button>
              </div>
            </div>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="输入要测试的文本..."
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: currentTheme.background,
                color: currentTheme.foreground,
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '14px',
                fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                lineHeight: '1.5',
              }}
            />
          </div>
        </div>

        {/* 右侧结果区域 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* 错误信息 */}
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#ffebee',
              border: '1px solid #f44336',
              borderRadius: '4px',
              color: '#c62828',
              fontSize: '14px',
            }}>
              错误: {error}
            </div>
          )}

          {/* 匹配结果 */}
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
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              匹配结果
              <span style={{ fontSize: '12px', color: currentTheme.placeholder }}>
                {matches.length} 个匹配
              </span>
            </div>
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '12px',
            }}>
              {matches.length > 0 ? (
                matches.map((match, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px',
                      marginBottom: '8px',
                      backgroundColor: currentTheme.header,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: '4px',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: currentTheme.placeholder, marginBottom: '4px' }}>
                      匹配 #{index + 1}
                    </div>
                    <div style={{ color: currentTheme.string, marginBottom: '4px' }}>
                      完整匹配: "{match[0]}"
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      位置: {match.index} - {(match.index || 0) + match[0].length}
                    </div>
                    {match.length > 1 && (
                      <div style={{ marginTop: '4px', fontSize: '12px' }}>
                        捕获组:
                        <div style={{ marginTop: '4px' }}>
                          {match.slice(1).map((group, i) => (
                            <span key={i} style={{ 
                              display: 'block',
                              marginBottom: '2px',
                              color: group ? currentTheme.number : currentTheme.placeholder 
                            }}>
                              ${i + 1}: "{group || '空'}"
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  height: '100%',
                  color: currentTheme.placeholder,
                  fontSize: '14px',
                  padding: '16px',
                }}>
                  没有匹配结果
                </div>
              )}
            </div>
          </div>

          {/* 常用正则 */}
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
              常用正则
            </div>
            <div style={{
              padding: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '4px',
            }}>
              {commonPatterns.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setPattern(item.pattern)}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
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
                  <div style={{ color: currentTheme.key, fontSize: '10px' }}>{item.name}</div>
                  <div style={{ 
                    color: currentTheme.placeholder, 
                    fontSize: '9px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.pattern}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;