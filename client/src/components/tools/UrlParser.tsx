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

interface URLParams {
  [key: string]: string;
}

interface URLComponents {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
}

const UrlParser: React.FC = () => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [params, setParams] = useState<URLParams>({});
  const [components, setComponents] = useState<URLComponents | null>(null);
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

  const sampleUrls = [
    { name: '百度搜索', url: 'https://www.baidu.com/s?wd=react&pn=10' },
    { name: 'Google搜索', url: 'https://www.google.com/search?q=typescript&oq=typescript' },
    { name: 'GitHub API', url: 'https://api.github.com/users/octocat/repos?page=1&per_page=10' },
    { name: '电商网站', url: 'https://shop.example.com/products?category=electronics&sort=price&min=1000' },
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

  const parseUrl = () => {
    if (!urlInput.trim()) return;

    try {
      const url = new URL(urlInput);
      
      // 解析参数
      const urlParams: URLParams = {};
      url.searchParams.forEach((value, key) => {
        urlParams[key] = value;
      });
      
      // 解析组件
      const urlComponents: URLComponents = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        origin: url.origin,
      };
      
      setParams(urlParams);
      setComponents(urlComponents);
    } catch (error) {
      setParams({});
      setComponents(null);
      alert('URL格式不正确，请输入完整的URL（包含协议）');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setUrlInput('');
    setParams({});
    setComponents(null);
  };

  const handleSampleUrl = (url: string) => {
    setUrlInput(url);
    parseUrl();
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
          🔗 URL参数解析器
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
          <span style={{ fontSize: '14px', color: currentTheme.foreground }}>快速示例:</span>
          {sampleUrls.map((sample) => (
            <button
              key={sample.name}
              onClick={() => handleSampleUrl(sample.url)}
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
              {sample.name}
            </button>
          ))}
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
        }}>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="输入完整的URL（如: https://example.com?param1=value1&param2=value2）"
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
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                parseUrl();
              }
            }}
          />
          <button
            onClick={parseUrl}
            disabled={!urlInput.trim()}
            style={{
              backgroundColor: urlInput.trim() ? currentTheme.button : currentTheme.border,
              color: currentTheme.buttonForeground || currentTheme.foreground,
              border: `1px solid ${currentTheme.border}`,
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: urlInput.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
            }}
          >
            解析
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
        {/* URL组件 */}
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
                onClick={() => components && copyToClipboard(components.origin)}
                disabled={!components}
                style={{
                  backgroundColor: components ? currentTheme.button : currentTheme.border,
                  color: currentTheme.buttonForeground || currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: components ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  transition: 'background-color 0.2s',
                }}
              >
                复制
              </button>
              <button
                onClick={() => setComponents(null)}
                disabled={!components}
                style={{
                  backgroundColor: currentTheme.border,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: components ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  transition: 'background-color 0.2s',
                }}
              >
                清空
              </button>
            </div>
          </div>
          <div style={{
            padding: '16px',
            overflow: 'auto',
          }}>
            {components ? (
              Object.entries(components).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    marginBottom: '12px',
                    padding: '8px',
                    backgroundColor: currentTheme.header,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: currentTheme.placeholder, marginBottom: '4px' }}>
                    {key}
                  </div>
                  <div style={{ 
                    color: currentTheme.foreground,
                    fontSize: '13px',
                    wordBreak: 'break-word',
                  }}>
                    {value || '(空)'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                color: currentTheme.placeholder,
                fontSize: '14px',
                padding: '16px',
              }}>
                输入URL进行解析
              </div>
            )}
          </div>
        </div>

        {/* URL参数 */}
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
                onClick={() => Object.keys(params).length > 0 && copyToClipboard(JSON.stringify(params, null, 2))}
                disabled={Object.keys(params).length === 0}
                style={{
                  backgroundColor: Object.keys(params).length > 0 ? currentTheme.button : currentTheme.border,
                  color: currentTheme.buttonForeground || currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: Object.keys(params).length > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  transition: 'background-color 0.2s',
                }}
              >
                复制JSON
              </button>
              <button
                onClick={() => setParams({})}
                disabled={Object.keys(params).length === 0}
                style={{
                  backgroundColor: currentTheme.border,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: Object.keys(params).length > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  transition: 'background-color 0.2s',
                }}
              >
                清空
              </button>
            </div>
          </div>
          <div style={{
            padding: '16px',
            overflow: 'auto',
          }}>
            {Object.keys(params).length > 0 ? (
              Object.entries(params).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    marginBottom: '12px',
                    padding: '8px',
                    backgroundColor: currentTheme.header,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: currentTheme.key, marginBottom: '4px' }}>
                    {key}
                  </div>
                  <div style={{ 
                    color: currentTheme.string,
                    fontSize: '13px',
                    wordBreak: 'break-word',
                  }}>
                    "{value}"
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                color: currentTheme.placeholder,
                fontSize: '14px',
                padding: '16px',
              }}>
                没有查询参数
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlParser;