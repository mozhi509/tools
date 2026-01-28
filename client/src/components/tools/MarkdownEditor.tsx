import React, { useState } from 'react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';

const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>('');

  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

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






  // HTML清理函数，防止XSS攻击
  const sanitizeHtml = (html: string): string => {
    // 移除危险的HTML标签和属性
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea'];
    const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'];
    
    let sanitized = html;
    
    // 移除危险标签
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
      // 自闭合标签
      const selfClosingRegex = new RegExp(`<${tag}[^>]*/>`, 'gi');
      sanitized = sanitized.replace(selfClosingRegex, '');
    });
    
    // 移除危险属性
    dangerousAttributes.forEach(attr => {
      const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    // 移除javascript:链接
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href=""');
    
    // 移除data: URL（除了允许的图片格式）
    sanitized = sanitized.replace(/src\s*=\s*["']data:(?!image\/(jpeg|png|gif|webp))[^"']*["']/gi, 'src=""');
    
    return sanitized;
  };

  const parseMarkdown = (text: string): string => {
    // 首先转义HTML特殊字符
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

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

    // 安全的链接处理
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, (_match, text, url) => {
      // 验证URL安全性
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
      // 禁止javascript:和data:等危险协议
      return `<span>${text}</span>`;
    });

    // 安全的图片处理
    html = html.replace(/!\[(.+?)\]\((.+?)\)/g, (_match, alt, src) => {
      // 只允许http, https和相对路径的图片
      if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/') || src.startsWith('data:image/')) {
        return `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto;" />`;
      }
      return `<span>[图片: ${alt}]</span>`;
    });

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

    // 最终HTML清理
    return sanitizeHtml(html);
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