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

const Base64Encoder: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [theme, setTheme] = useState<string>('vs-light');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const getThemeColors = (themeName: string) => {
    return themes[themeName as keyof typeof themes] || themes['vs-light'];
  };

  const location = useLocation();
  const navigate = useNavigate();

  // 页面加载时从localStorage恢复设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('json-formatter-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // 主题变化时保存到localStorage
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
            {/* Logo */}
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
              
              {/* 主题选择器 */}
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

  const processBase64 = () => {
    try {
      if (mode === 'encode') {
        // 编码文本到Base64
        const encoded = btoa(unescape(encodeURIComponent(inputText)));
        setOutputText(encoded);
      } else {
        // 解码Base64到文本
        const decoded = decodeURIComponent(escape(atob(inputText)));
        setOutputText(decoded);
      }
    } catch (error) {
      setOutputText(`错误: ${error instanceof Error ? error.message : '解码失败'}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (file.type.startsWith('image/')) {
          // 对于图片，直接显示DataURL，这已经是Base64格式
          setInputText('图片已上传 (点击解码查看)');
          setOutputText(content);
          setMode('decode'); // 切换到解码模式
        } else {
          setInputText(content);
          // 自动编码文本
          try {
            const encoded = btoa(content);
            setOutputText(encoded);
          } catch (error) {
            setOutputText('编码失败');
          }
        }
      };
      reader.readAsDataURL(file);
    }
    // 清空文件输入，允许重复上传同一文件
    if (event.target) {
      event.target.value = '';
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // 先清空
      fileInputRef.current.click(); // 再触发
    }
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
          🔤 Base64 编解码器
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

      {/* 模式选择 */}
      <div style={{
        padding: '16px',
        backgroundColor: currentTheme.header,
        borderBottom: `1px solid ${currentTheme.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <span style={{ fontSize: '14px', color: currentTheme.foreground }}>模式:</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <input
            type="radio"
            name="mode"
            value="encode"
            checked={mode === 'encode'}
            onChange={() => setMode('encode')}
          />
          <span style={{ fontSize: '14px' }}>编码</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <input
            type="radio"
            name="mode"
            value="decode"
            checked={mode === 'decode'}
            onChange={() => setMode('decode')}
          />
          <span style={{ fontSize: '14px' }}>解码</span>
        </label>
        <span
          style={{
            fontSize: '14px',
            color: currentTheme.button,
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
          onClick={triggerFileUpload}
        >
          上传图片
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
      </div>

      {/* 主内容区域 */}
      <div style={{
        display: 'flex',
        flex: 1,
        padding: '16px',
        gap: '16px',
        overflow: 'hidden',
      }}>
          {/* 输入区域 */}
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
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={processBase64}
                disabled={!inputText.trim()}
                style={{
                  backgroundColor: inputText.trim() ? currentTheme.button : currentTheme.border,
                  color: currentTheme.buttonForeground || currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  transition: 'background-color 0.2s',
                }}
              >
                {mode === 'encode' ? '编码' : '解码'}
              </button>
              <button
                onClick={() => copyToClipboard(inputText)}
                disabled={!inputText.trim()}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.buttonForeground || currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  transition: 'background-color 0.2s',
                }}
              >
                复制输入
              </button>
              <button
                onClick={() => setInputText('')}
                disabled={!inputText.trim()}
                style={{
                  backgroundColor: currentTheme.border,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  transition: 'background-color 0.2s',
                }}
              >
                清空
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={mode === 'encode' ? '在此输入要编码的文本...' : '在此输入要解码的Base64字符串...'}
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
        </div>

        {/* 输出区域 */}
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
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => copyToClipboard(outputText)}
                disabled={!outputText.trim()}
                style={{
                  backgroundColor: outputText.trim() ? currentTheme.button : currentTheme.border,
                  color: currentTheme.buttonForeground || currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: outputText.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  transition: 'background-color 0.2s',
                }}
              >
                复制输出
              </button>
              <button
                onClick={() => setOutputText('')}
                disabled={!outputText.trim()}
                style={{
                  backgroundColor: currentTheme.border,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: outputText.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  transition: 'background-color 0.2s',
                }}
              >
                清空
              </button>
              {outputText.startsWith('data:image/') && (
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = outputText;
                    link.download = 'decoded-image.' + outputText.split('/')[1].split(';')[0];
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
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
                  下载图片
                </button>
              )}
            </div>
          </div>
          {outputText ? (
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
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {outputText.startsWith('data:image/') ? (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ marginBottom: '8px', fontSize: '12px', color: currentTheme.placeholder }}>
                    图片Base64数据预览:
                  </div>
                  <textarea
                    readOnly
                    value={outputText.substring(0, 200) + '...'}
                    style={{
                      width: '100%',
                      height: '60px',
                      backgroundColor: currentTheme.background,
                      color: currentTheme.foreground,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: '4px',
                      padding: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      marginBottom: '12px',
                    }}
                  />
                  <img 
                    src={outputText} 
                    alt="解码的图片" 
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: '4px',
                    }}
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {outputText}
                </div>
              )}
            </div>
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
              请输入数据并点击{mode === 'encode' ? '编码' : '解码'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Base64Encoder;