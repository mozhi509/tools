import React, { useState } from 'react';
import ToolNavigation from '../ToolNavigation';

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState<string>('');
  const [flags, setFlags] = useState<string>('g');
  const [testText, setTestText] = useState<string>('');
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [error, setError] = useState<string>('');

  const commonPatterns = [
    { name: '邮箱', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' },
    { name: '手机号', pattern: '^1[3-9]\d{9}$' },
    { name: 'URL', pattern: 'https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)' },
    { name: 'IP地址', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$' },
    { name: '身份证', pattern: '^\d{15}|\d{18}|\d{17}[Xx]$' },
    { name: '中文', pattern: '[\u4e00-\u9fa5]+' },
    { name: '数字', pattern: '\d+' },
    { name: '字母', pattern: '[a-zA-Z]+' },
  ];

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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
    }}>
      <ToolNavigation 
        theme=""
        setTheme={() => {}}
        currentTheme={{
          name: 'vs-light',
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
        }}
      />
      
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e1e1e1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
      }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'normal' }}>
          🔍 正则表达式测试
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={clearAll}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
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
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '12px',
              alignItems: 'center',
            }}>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="输入正则表达式..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
              <select
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                style={{
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                }}
              >
                <option value="">无标志</option>
                <option value="g">全局 (g)</option>
                <option value="i">忽略大小写 (i)</option>
                <option value="m">多行 (m)</option>
                <option value="gi">全局+忽略大小写</option>
              </select>
            </div>

            {/* 常用模式 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>
                常用模式：
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '8px',
              }}>
                {commonPatterns.map((commonPattern, index) => (
                  <button
                    key={index}
                    onClick={() => setPattern(commonPattern.pattern)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      backgroundColor: '#f8f9fa',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {commonPattern.name}
                      </div>
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        color: '#6c757d',
                        wordBreak: 'break-all',
                      }}>
                        {commonPattern.pattern}
                      </div>
                    </button>
                ))}
              </div>
            </div>
          </div>

          {/* 测试文本输入 */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '16px',
            flex: 1,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                测试文本：
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setTestText('Hello World! 123 email@test.com')}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  使用示例
                </button>
                <button
                  onClick={() => copyToClipboard(testText)}
                  disabled={!testText.trim()}
                  style={{
                    backgroundColor: testText.trim() ? '#28a745' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: testText.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '12px',
                  }}
                >
                  复制文本
                </button>
              </div>
            </div>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="在此输入要测试的文本..."
              style={{
                width: '100%',
                height: '200px',
                padding: '12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical',
                outline: 'none',
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
            }}>
              <button
                onClick={testRegex}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                测试匹配
              </button>
              {error && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '12px',
                  textAlign: 'right',
                }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧结果区域 */}
        <div style={{
          flex: 1,
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '16px',
          overflow: 'auto',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
              匹配结果 ({matches.length})
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {matches.length > 0 && (
                <button
                  onClick={() => copyToClipboard(matches.map(m => m[0]).join('\n'))}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  复制所有匹配
                </button>
              )}
            </div>
          </div>

          {error && (
            <div style={{
              color: '#dc3545',
              padding: '12px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              fontSize: '14px',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {!error && matches.length === 0 && pattern && (
            <div style={{
              color: '#6c757d',
              textAlign: 'center',
              padding: '20px',
              fontSize: '14px',
            }}>
              没有找到匹配项
            </div>
          )}

          {!error && matches.length > 0 && (
            <div style={{ textAlign: 'left' }}>
              {matches.map((match, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    padding: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}>
                    <span style={{
                      fontWeight: 'bold',
                      color: '#007bff',
                      fontSize: '12px',
                    }}>
                      匹配 #{index + 1}
                    </span>
                    <button
                      onClick={() => copyToClipboard(match[0])}
                      style={{
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      复制
                    </button>
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>匹配文本：</strong> {match[0]}
                    </div>
                    {match.length > 1 && (
                      <div style={{ marginTop: '8px' }}>
                        <strong>捕获组：</strong>
                        {match.slice(1).map((group, groupIndex) => (
                          <div
                            key={groupIndex}
                            style={{
                              backgroundColor: '#e9ecef',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              marginTop: '4px',
                              fontFamily: 'monospace',
                              fontSize: '12px',
                            }}
                          >
                            组 {groupIndex + 1}: {group || '(空)'}
                          </div>
                        ))}
                      </div>
                    )}
                    {match.index !== undefined && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#6c757d' }}>
                        位置: {match.index} - {match.index + match[0].length}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegexTester;