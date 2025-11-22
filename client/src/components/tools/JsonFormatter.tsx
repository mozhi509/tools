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

const JsonFormatter: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [inputJson, setInputJson] = useState<string>('');
  const [outputJson, setOutputJson] = useState<string>('');
  const [minifiedJson, setMinifiedJson] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(true);
  const [showMinified, setShowMinified] = useState<boolean>(false);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [theme, setTheme] = useState<string>('vs-light');

  // 页面加载时从localStorage恢复设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('json-formatter-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    const savedIndentSize = localStorage.getItem('json-formatter-indent');
    if (savedIndentSize) {
      setIndentSize(parseInt(savedIndentSize, 10));
    }
  }, []);

  // 主题变化时保存到localStorage
  useEffect(() => {
    localStorage.setItem('json-formatter-theme', theme);
  }, [theme]);

  // 空格变化时保存到localStorage
  useEffect(() => {
    localStorage.setItem('json-formatter-indent', indentSize.toString());
  }, [indentSize]);

  const formatJson = async (): Promise<void> => {
    if (!inputJson.trim()) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/tools/json/format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          json: inputJson,
          indent: indentSize 
        }),
      });

      const data = await response.json();
      
      if (data.success && data.formatted) {
        setOutputJson(data.formatted);
        setShowOutput(true);
        setShowMinified(false);
        setIsValid(true);
        setValidationError('');
        setExpandedNodes(new Set(['root']));
      } else {
        setOutputJson(data.error || '格式化失败');
        setIsValid(false);
        setValidationError(data.error || '');
      }
    } catch (error) {
      setOutputJson('网络连接错误');
      setIsValid(false);
      setValidationError('网络连接错误');
    } finally {
      setProcessing(false);
    }
  };

  const validateJson = async (): Promise<void> => {
    if (!inputJson.trim()) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/tools/json/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ json: inputJson }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsValid(data.valid);
        setValidationError(data.error || '');
      } else {
        setIsValid(false);
        setValidationError(data.error || '验证失败');
      }
    } catch (error) {
      setIsValid(false);
      setValidationError('网络连接错误');
    } finally {
      setProcessing(false);
    }
  };

  const minifyJson = async (): Promise<void> => {
    if (!inputJson.trim()) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/tools/json/minify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ json: inputJson }),
      });

      const data = await response.json();
      
      if (data.success && data.minified) {
        setMinifiedJson(data.minified);
        setShowOutput(false);
        setShowMinified(true);
        setIsValid(true);
        setValidationError('');
        setExpandedNodes(new Set());
      } else {
        setMinifiedJson(data.error || '压缩失败');
        setIsValid(false);
        setValidationError(data.error || '');
      }
    } catch (error) {
      setMinifiedJson('网络连接错误');
      setIsValid(false);
      setValidationError('网络连接错误');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      alert('已复制到剪贴板');
    } catch (error) {
      alert('复制失败');
    }
  };

  const toggleNode = (path: string): void => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  const renderJsonTree = (data: any, path: string = '', indent: number = 0, isLast: boolean = true): React.ReactNode => {
    if (data === null) {
      return <span style={{ color: currentTheme.boolean }}>null</span>;
    }
    
    if (data === undefined) {
      return <span style={{ color: currentTheme.boolean }}>undefined</span>;
    }
    
    if (typeof data === 'string') {
      return <span style={{ color: currentTheme.string }}>"{data}"</span>;
    }
    
    if (typeof data === 'number') {
      return <span style={{ color: currentTheme.number }}>{data}</span>;
    }
    
    if (typeof data === 'boolean') {
      return <span style={{ color: currentTheme.boolean }}>{String(data)}</span>;
    }
    
    if (Array.isArray(data)) {
      const isExpanded = expandedNodes.has(path);
      const isEmpty = data.length === 0;
      
      return (
        <span>
          <span style={{ color: currentTheme.bracket }}>[</span>
          {!isEmpty && (
            <button
              onClick={() => toggleNode(path)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: currentTheme.foreground,
                cursor: 'pointer',
                padding: '0 4px',
                fontSize: '12px',
                marginLeft: '4px',
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!isExpanded && !isEmpty && (
            <>
              <span style={{ color: currentTheme.placeholder, fontSize: '12px', margin: '0 4px' }}>
                {data.length} items
              </span>
              <span style={{ color: currentTheme.bracket }}>]</span>
            </>
          )}
          {isEmpty && <span style={{ color: currentTheme.comma }}>]</span>}
          
          {isExpanded && !isEmpty && (
            <div style={{ marginLeft: `${(indent + 1) * 16}px` }}>
              {data.map((item, index) => (
                <div key={index}>
                  {renderJsonTree(item, `${path}[${index}]`, indent + 1, index === data.length - 1)}
                  {index < data.length - 1 && <span style={{ color: currentTheme.comma }}>,</span>}
                </div>
              ))}
              <div style={{ color: currentTheme.bracket }}>]</div>
            </div>
          )}
        </span>
      );
    }
    
    if (typeof data === 'object') {
      const isExpanded = expandedNodes.has(path);
      const entries = Object.entries(data);
      const isEmpty = entries.length === 0;
      
      return (
        <span>
          <span style={{ color: currentTheme.bracket }}>{'{'}</span>
          {!isEmpty && (
            <button
              onClick={() => toggleNode(path)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: currentTheme.foreground,
                cursor: 'pointer',
                padding: '0 4px',
                fontSize: '12px',
                marginLeft: '4px',
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!isExpanded && !isEmpty && (
            <>
              <span style={{ color: currentTheme.placeholder, fontSize: '12px', margin: '0 4px' }}>
                {entries.length} properties
              </span>
              <span style={{ color: currentTheme.bracket }}>{'}'}</span>
            </>
          )}
          {isEmpty && <span style={{ color: currentTheme.comma }}>{'}'}</span>}
          
          {isExpanded && !isEmpty && (
            <div style={{ marginLeft: `${(indent + 1) * 16}px` }}>
              {entries.map(([key, value], index) => (
                <div key={key}>
                  <span style={{ color: currentTheme.key }}>"{key}"</span>
                  <span style={{ color: currentTheme.comma }}>: </span>
                  {renderJsonTree(value, `${path}.${key}`, indent + 1, index === entries.length - 1)}
                  {index < entries.length - 1 && <span style={{ color: currentTheme.comma }}>,</span>}
                </div>
              ))}
              <div style={{ color: currentTheme.bracket }}>{'}'}</div>
            </div>
          )}
        </span>
      );
    }
    
    return null;
  };

  const downloadFile = (content: string, filename: string): void => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const loadExample = (): void => {
    const exampleJson = {
      "name": "John Doe",
      "age": 30,
      "email": "john.doe@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "country": "USA",
        "coordinates": {
          "lat": 40.7128,
          "lng": -74.0060
        }
      },
      "hobbies": ["reading", "swimming", "coding"],
      "isStudent": false,
      "scores": [85, 92, 78, 96],
      "metadata": {
        "created": "2024-01-15T10:30:00Z",
        "updated": "2024-01-20T14:45:00Z",
        "version": 1.2
      }
    };
    
    setInputJson(JSON.stringify(exampleJson));
    setOutputJson('');
    setMinifiedJson('');
    setIsValid(null);
    setValidationError('');
    setShowOutput(true);
    setShowMinified(false);
    setExpandedNodes(new Set());
  };

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
      buttonForeground: '#000000'
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
      buttonForeground: '#000000'
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
      buttonForeground: '#000000'
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
      buttonForeground: '#000000'
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
      buttonForeground: '#000000'
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

  const getThemeColors = (themeName: string) => {
    return themes[themeName as keyof typeof themes] || themes['vs-dark'];
  };

  const clearAll = (): void => {
    setInputJson('');
    setOutputJson('');
    setMinifiedJson('');
    setIsValid(null);
    setValidationError('');
    setShowOutput(true);
    setShowMinified(false);
    setExpandedNodes(new Set());
  };

  const currentTheme = getThemeColors(theme);

  const renderNavigation = (): React.ReactNode => {
    return (
      <div style={{
        backgroundColor: currentTheme.header,
        borderBottom: `1px solid ${currentTheme.border}`,
        padding: '8px 0',
      }}>
        <div style={{
          //maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            {/* Logo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginRight: '16px',
              paddingRight: '16px',
              borderRight: `1px solid ${currentTheme.border}`,
            }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: currentTheme.button }}>
                🔧
              </span>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: currentTheme.foreground 
              }}>
                DevTools
              </span>
            </div>
            
            {/* 工具导航 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              gap: '16px',
            }}>
              {/* 工具导航 */}
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
                      ? currentTheme.button 
                      : 'transparent',
                    color: location.pathname === tool.path 
                      ? (currentTheme.buttonForeground || currentTheme.foreground)
                      : currentTheme.placeholder,
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
              </div>
              
              {/* 主题选择器 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: '11px',
                  color: currentTheme.placeholder,
                  marginRight: '4px',
                }}>
                  主题:
                </span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  style={{
                    backgroundColor: currentTheme.background,
                    color: currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: currentTheme.background,
      color: currentTheme.foreground,
      fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
    }}>
      {/* 导航栏 */}
      {renderNavigation()}
      
      {/* 工具标题栏 */}
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${currentTheme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: currentTheme.header,
      }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'normal' }}>
          JSON 格式化工具
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            style={{
              backgroundColor: themes[theme as keyof typeof themes]?.header || '#2d2d30',
              color: themes[theme as keyof typeof themes]?.foreground || '#d4d4d4',
              border: `1px solid ${themes[theme as keyof typeof themes]?.border || '#3e3e42'}`,
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
            <option value={8}>8 空格</option>
          </select>
          <button
            onClick={clearAll}
            style={{
              backgroundColor: themes[theme as keyof typeof themes]?.border || '#3e3e42',
              color: themes[theme as keyof typeof themes]?.foreground || '#d4d4d4',
              border: 'none',
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

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        padding: '16px',
        gap: '16px',
        overflow: 'hidden',
      }}>
        {/* Input Section */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
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
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={loadExample}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                示例
              </button>
              <button
                onClick={validateJson}
                disabled={processing}
                style={{
                  backgroundColor: isValid === true ? '#238636' : isValid === false ? '#da3633' : currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                {processing ? '处理中...' : '验证'}
              </button>
            </div>
          </div>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="在此输入 JSON 数据..."
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: currentTheme.background,
              color: currentTheme.foreground,
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              fontSize: '14px',
              lineHeight: '1.5',
              caretColor: currentTheme.button
            }}
          />
          {validationError && (
            <div style={{
              padding: '12px',
              backgroundColor: '#da3633',
              color: 'white',
              fontSize: '12px',
            }}>
              {validationError}
            </div>
          )}
        </div>

        {/* Output Section */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
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
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {(showOutput || showMinified) && (
                <button
                  onClick={() => setExpandedNodes(new Set())}
                  style={{
                    backgroundColor: theme === 'vs-high-contrast' ? currentTheme.button : currentTheme.border,
                    color: currentTheme.buttonForeground || currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  全部折叠
                </button>
              )}
              {(showOutput || showMinified) && (
                <button
                  onClick={() => {
                    const allPaths = new Set<string>();
                    const collectPaths = (data: any, path: string = '') => {
                      if (Array.isArray(data)) {
                        allPaths.add(path);
                        data.forEach((item, index) => {
                          if (typeof item === 'object' && item !== null) {
                            collectPaths(item, `${path}[${index}]`);
                          }
                        });
                      } else if (typeof data === 'object' && data !== null) {
                        allPaths.add(path);
                        Object.entries(data).forEach(([key, value]) => {
                          if (typeof value === 'object' && value !== null) {
                            collectPaths(value, `${path}.${key}`);
                          }
                        });
                      }
                    };
                    try {
                      const parsed = JSON.parse(showOutput ? outputJson : minifiedJson);
                      collectPaths(parsed, 'root');
                      setExpandedNodes(allPaths);
                    } catch (e) {}
                  }}
                  style={{
                    backgroundColor: theme === 'vs-high-contrast' ? currentTheme.button : currentTheme.border,
                    color: currentTheme.buttonForeground || currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  全部展开
                </button>
              )}
              <button
                onClick={formatJson}
                disabled={processing || !inputJson.trim()}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: processing || !inputJson.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                格式化
              </button>
              <button
                onClick={minifyJson}
                disabled={processing || !inputJson.trim()}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: processing || !inputJson.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                压缩
              </button>
              <button
                onClick={() => copyToClipboard(showOutput ? outputJson : minifiedJson)}
                disabled={!showOutput && !showMinified}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: (!showOutput && !showMinified) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                复制
              </button>
              <button
                onClick={() => downloadFile(showOutput ? outputJson : minifiedJson, showOutput ? 'formatted.json' : 'minified.json')}
                disabled={!showOutput && !showMinified}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: (!showOutput && !showMinified) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                下载
              </button>
            </div>
          </div>
          {(showOutput || showMinified) ? (
            <div style={{
              flex: 1,
              padding: '16px',
              backgroundColor: currentTheme.background,
              color: currentTheme.foreground,
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              fontSize: '14px',
              lineHeight: '1.5',
              overflow: 'auto',
              whiteSpace: 'pre',
              textAlign: 'left',
              alignItems: 'flex-start',
              justifyContent: 'flex-start'
            }}>
              {(() => {
                try {
                  const jsonText = showOutput ? outputJson : minifiedJson;
                  if (!jsonText || jsonText.trim() === '') {
                    return <span style={{ color: currentTheme.placeholder }}>请先输入JSON数据并点击格式化</span>;
                  }
                  const data = JSON.parse(jsonText);
                  return renderJsonTree(data, 'root', 0, true);
                } catch (e) {
                  return <span style={{ color: '#da3633' }}>JSON格式错误</span>;
                }
              })()}
            </div>
          ) : (
            <div style={{
              flex: 1,
              padding: '16px',
              backgroundColor: '#1e1e1e',
              color: '#8b949e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <div>格式化或压缩结果将显示在这里</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonFormatter;