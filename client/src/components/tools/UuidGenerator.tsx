import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Tool {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
}

interface UuidInfo {
  uuid: string;
  timestamp: number;
  version: string;
  variant: string;
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

const UuidGenerator: React.FC = () => {
  const [uuids, setUuids] = useState<UuidInfo[]>([]);
  const [amount, setAmount] = useState<number>(1);
  const [version, setVersion] = useState<string>('v4');
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [withDashes, setWithDashes] = useState<boolean>(true);
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