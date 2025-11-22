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

const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>('');
  const [theme, setTheme] = useState<string>('vs-light');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

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

  const sampleMarkdown = `# Markdown 示例

## 基础语法

### 1. 标题
\`# 一级标题\`
\`## 二级标题\`
\`### 三级标题\`

### 2. 文本格式
**粗体文本** 或 __粗体文本__
*斜体文本* 或 _斜体文本_
***粗斜体文本***
~~删除线~~
\`行内代码\`

### 3. 列表

#### 无序列表
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2
- 项目 3

#### 有序列表
1. 第一步
2. 第二步
3. 第三步

### 4. 链接和图片

[Google](https://www.google.com)

![图片示例](https://via.placeholder.com/300x200)

### 5. 表格

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |

### 6. 引用

> 这是一段引用
> 可以有多行

### 7. 代码块

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

---

**提示**: 在左侧编辑器中输入Markdown，右侧实时预览效果！`;

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
              alignItems: 'center',
              justifyContent: 'space-between',
              flex: 1,
              width: '100%',
            }}>
              <div style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
                overflow: 'auto',
                marginRight: 'auto',
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
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
                marginLeft: 'auto',
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

  const parseMarkdown = (text: string): string => {
    let html = text;

    // 标题
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // 粗体和斜体
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // 删除线
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // 行内代码
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    // 代码块
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // 链接
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');

    // 图片
    html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />');

    // 引用
    html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');

    // 无序列表 - 简化处理
    const lines = html.split('\n');
    const processedLines = lines.map(line => {
      if (line.match(/^[\*\-] (.+)$/)) {
        return '<li>' + line.replace(/^[\*\-] /, '') + '</li>';
      }
      return line;
    });
    html = processedLines.join('\n');

    // 有序列表 - 简化处理
    const processedLines2 = html.split('\n').map(line => {
      if (line.match(/^\d+\. (.+)$/)) {
        return '<li>' + line.replace(/^\d+\. /, '') + '</li>';
      }
      return line;
    });
    html = processedLines2.join('\n');

    // 水平线
    html = html.replace(/^---$/gim, '<hr>');

    // 表格
    html = html.replace(/\|(.+)\|/g, function(match) {
      const cells = match.split('|').filter(cell => cell.trim());
      const headerCells = cells.map(cell => `<th>${cell.trim()}</th>`).join('');
      return `<table><tr>${headerCells}</tr></table>`;
    });

    return html;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setMarkdown('');
  };

  const useSample = () => {
    setMarkdown(sampleMarkdown);
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
          📝 Markdown编辑器
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={useSample}
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.key,
              border: `1px solid ${currentTheme.border}`,
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            使用示例
          </button>
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
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            style={{
              backgroundColor: currentTheme.button,
              color: currentTheme.buttonForeground || currentTheme.foreground,
              border: `1px solid ${currentTheme.border}`,
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {isPreviewMode ? '编辑模式' : '预览模式'}
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flex: 1,
        padding: '16px',
        gap: '16px',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {!isPreviewMode ? (
          <>
            {/* 编辑器 */}
            <div style={{
              flex: 1,
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: currentTheme.header,
                borderBottom: `1px solid ${currentTheme.border}`,
                flexShrink: 0,
              }}>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}>
                  <button
                    onClick={() => copyToClipboard(markdown)}
                    disabled={!markdown.trim()}
                    style={{
                      backgroundColor: markdown.trim() ? currentTheme.button : currentTheme.border,
                      color: currentTheme.buttonForeground || currentTheme.foreground,
                      border: `1px solid ${currentTheme.border}`,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: markdown.trim() ? 'pointer' : 'not-allowed',
                      fontSize: '11px',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    复制
                  </button>
                  <button
                    onClick={() => setMarkdown('')}
                    disabled={!markdown.trim()}
                    style={{
                      backgroundColor: currentTheme.border,
                      color: currentTheme.foreground,
                      border: `1px solid ${currentTheme.border}`,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: markdown.trim() ? 'pointer' : 'not-allowed',
                      fontSize: '11px',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    清空
                  </button>
                </div>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="在此输入Markdown内容..."
                style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: currentTheme.background,
                  color: currentTheme.foreground,
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: '14px',
                  fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                  lineHeight: '1.5',
                  caretColor: currentTheme.button,
                  width: '100%',
                  height: '100%',
                  minHeight: '400px',
                }}
              />
            </div>

            {/* 预览 */}
            <div style={{
              flex: 1,
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: currentTheme.header,
                borderBottom: `1px solid ${currentTheme.border}`,
                flexShrink: 0,
              }}>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: '14px', color: currentTheme.foreground }}>
                    预览
                  </span>
                </div>
              </div>
              <div style={{
                flex: 1,
                padding: '16px',
                overflow: 'auto',
                backgroundColor: currentTheme.background,
                color: currentTheme.foreground,
                fontSize: '14px',
                lineHeight: '1.6',
                minHeight: '400px',
                textAlign: 'left',
              }}>
                {markdown ? (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: parseMarkdown(markdown) 
                    }}
                    style={{
                      color: currentTheme.foreground,
                      textAlign: 'left',
                    }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    color: currentTheme.placeholder,
                    fontSize: '14px',
                    padding: '16px',
                    textAlign: 'left',
                  }}>
                    在左侧输入Markdown内容，右侧实时预览
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* 全屏预览 */
          <div style={{
            flex: 1,
            backgroundColor: currentTheme.background,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: currentTheme.header,
              borderBottom: `1px solid ${currentTheme.border}`,
              flexShrink: 0,
            }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: '14px', color: currentTheme.foreground }}>
                  全屏预览
                </span>
              </div>
            </div>
            <div style={{
              flex: 1,
              padding: '16px',
              overflow: 'auto',
              backgroundColor: currentTheme.background,
              color: currentTheme.foreground,
              fontSize: '14px',
              lineHeight: '1.6',
              minHeight: '400px',
              textAlign: 'left',
            }}>
              {markdown ? (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: parseMarkdown(markdown) 
                  }}
                  style={{
                    color: currentTheme.foreground,
                    textAlign: 'left',
                    maxWidth: '800px',
                    margin: '0 auto',
                  }}
                />
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  color: currentTheme.placeholder,
                  fontSize: '14px',
                  padding: '16px',
                  textAlign: 'left',
                }}>
                  输入Markdown内容进行预览
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;