import React, { useState, useEffect } from 'react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';

const TimestampConverter: React.FC = () => {
  const [timestamp, setTimestamp] = useState<string>('');
  const [datetime, setDatetime] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [conversions, setConversions] = useState<any[]>([]);


  const commonTimestamps = [
    { name: '当前时间', value: Date.now() },
    { name: '今天开始', value: new Date().setHours(0, 0, 0, 0) },
    { name: '今天结束', value: new Date().setHours(23, 59, 59, 999) },
    { name: '昨天开始', value: new Date(Date.now() - 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0) },
    { name: '明天开始', value: new Date(Date.now() + 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0) },
    { name: '本周开始', value: new Date(Date.now() - (new Date().getDay() || 7) * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0) },
    { name: '本月开始', value: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() },
    { name: '今年开始', value: new Date(new Date().getFullYear(), 0, 1).getTime() },
  ];




  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  const timestampToDate = (ts: string): Date => {
    const num = parseInt(ts, 10);
    if (isNaN(num)) return new Date();
    if (ts.length === 10) {
      return new Date(num * 1000);
    } else {
      return new Date(num);
    }
  };

  const dateToTimestamp = (dateStr: string): number => {
    return new Date(dateStr).getTime();
  };

  const formatTimestamps = (date: Date): any => {
    return {
      'Unix时间戳(秒)': Math.floor(date.getTime() / 1000),
      'Unix时间戳(毫秒)': date.getTime(),
      'ISO 8601': date.toISOString(),
      '本地时间': date.toLocaleString(),
      'UTC时间': date.toUTCString(),
      '时区': Intl.DateTimeFormat().resolvedOptions().timeZone,
      '星期': ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
    };
  };

  const convertTimestamp = () => {
    if (!timestamp.trim()) return;
    
    try {
      const date = timestampToDate(timestamp);
      const formats = formatTimestamps(date);
      setConversions([formats]);
      setDatetime(date.toISOString().slice(0, 16));
    } catch (error) {
      setConversions([{
        '错误': '时间戳格式不正确'
      }]);
    }
  };

  const convertDatetime = () => {
    if (!datetime) return;
    
    try {
      const ts = dateToTimestamp(datetime);
      const date = new Date(ts);
      const formats = formatTimestamps(date);
      setConversions([formats]);
      setTimestamp(Math.floor(ts / 1000).toString());
    } catch (error) {
      setConversions([{
        '错误': '日期时间格式不正确'
      }]);
    }
  };

  const clearAll = () => {
    setTimestamp('');
    setDatetime('');
    setConversions([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleQuickTime = (ts: number) => {
    setTimestamp(Math.floor(ts / 1000).toString());
    const date = new Date(ts);
    setDatetime(date.toISOString().slice(0, 16));
    const formats = formatTimestamps(date);
    setConversions([formats]);
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
          🕐 时间戳转换器
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            fontSize: '14px',
            color: currentTheme.placeholder,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>当前时间:</span>
            <span style={{ color: currentTheme.foreground, fontFamily: 'monospace' }}>
              {currentTime.toLocaleString()}
            </span>
            <span style={{ 
              fontSize: '12px',
              color: currentTheme.number,
              fontFamily: 'monospace' 
            }}>
              ({Math.floor(currentTime.getTime() / 1000)})
            </span>
          </div>
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
          {/* 时间戳转日期 */}
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
              时间戳 → 日期时间
            </div>
            <div style={{
              padding: '12px',
              display: 'flex',
              gap: '8px',
            }}>
              <input
                type="number"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                placeholder="输入时间戳 (秒或毫秒)..."
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
              />
              <button
                onClick={convertTimestamp}
                disabled={!timestamp.trim()}
                style={{
                  backgroundColor: timestamp.trim() ? currentTheme.button : currentTheme.border,
                  color: currentTheme.buttonForeground || currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: timestamp.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                }}
              >
                转换
              </button>
            </div>
          </div>

          {/* 日期转时间戳 */}
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
              日期时间 → 时间戳
            </div>
            <div style={{
              padding: '12px',
              display: 'flex',
              gap: '8px',
            }}>
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
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
              />
              <button
                onClick={convertDatetime}
                disabled={!datetime}
                style={{
                  backgroundColor: datetime ? currentTheme.button : currentTheme.border,
                  color: currentTheme.buttonForeground || currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: datetime ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                }}
              >
                转换
              </button>
            </div>
          </div>

          {/* 快速选择 */}
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
              快速选择
            </div>
            <div style={{
              padding: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '4px',
            }}>
              {commonTimestamps.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleQuickTime(item.value)}
                  style={{
                    padding: '8px',
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
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
                  <div style={{ color: currentTheme.key, fontSize: '11px', fontWeight: 'bold' }}>
                    {item.name}
                  </div>
                  <div style={{ 
                    color: currentTheme.placeholder, 
                    fontSize: '9px',
                    fontFamily: 'monospace',
                  }}>
                    {Math.floor(item.value / 1000)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧结果区域 */}
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
          }}>
            转换结果
          </div>
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '12px',
          }}>
            {conversions.length > 0 ? (
              conversions.map((conversion, index) => (
                <div key={index}>
                  {Object.entries(conversion).map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        padding: '8px',
                        marginBottom: '8px',
                        backgroundColor: currentTheme.header,
                        border: `1px solid ${currentTheme.border}`,
                      borderRadius: '4px',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ color: currentTheme.key, fontSize: '12px' }}>
                          {key}
                        </span>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <span style={{ 
                            color: currentTheme.foreground,
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            wordBreak: 'break-all',
                            flex: 1,
                          }}>
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(String(value))}
                            style={{
                              backgroundColor: currentTheme.button,
                              color: currentTheme.buttonForeground || currentTheme.foreground,
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              flexShrink: 0,
                            }}
                          >
                            复制
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: currentTheme.placeholder,
                fontSize: '14px',
              }}>
                输入时间戳或日期时间进行转换
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimestampConverter;