import React, { useState, useEffect } from 'react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';

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

  const sampleUrls = [
    { name: '百度搜索', url: 'https://www.baidu.com/s?wd=react&pn=10' },
    { name: 'Google搜索', url: 'https://www.google.com/search?q=typescript&oq=typescript' },
    { name: 'GitHub API', url: 'https://api.github.com/users/octocat/repos?page=1&per_page=10' },
    { name: '电商网站', url: 'https://shop.example.com/products?category=electronics&sort=price&min=1000' },
  ];


  useEffect(() => {
    const savedTheme = localStorage.getItem('json-formatter-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('json-formatter-theme', theme);
  }, [theme]);


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