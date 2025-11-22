import React, { useState, useEffect } from 'react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState<string>('');
  const [flags, setFlags] = useState<string>('g');
  const [testText, setTestText] = useState<string>('');
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [error, setError] = useState<string>('');
  const [theme, setTheme] = useState<string>('vs-light');

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

  const currentTheme = getThemeColors(theme);

  useEffect(() => {
    const savedTheme = localStorage.getItem('json-formatter-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('json-formatter-theme', theme);
  }, [theme]);


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