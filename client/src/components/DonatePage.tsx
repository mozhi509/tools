import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { themes, ThemeColors } from './themes';
import ToolNavigation from './ToolNavigation';

interface DonateMethod {
  id: string;
  type: string;
  name: string;
  icon: string;
  qr: string;
  account?: string;
  address?: string;
  color: string;
  description?: string;
}

interface DonationAmount {
  amount: number;
  currency: string;
  symbol: string;
}

const DonatePage: React.FC = () => {
  const [theme, setTheme] = useState<string>('light');
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(themes.light || {
    background: '#ffffff',
    foreground: '#000000',
    header: '#f5f5f5',
    border: '#e0e0e0',
    button: '#007bff',
    buttonForeground: '#ffffff',
    placeholder: '#6c757d',
  });
  const [copiedText, setCopiedText] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [showQRLarge, setShowQRLarge] = useState<boolean>(false);
  const [donationStats] = useState({
    totalDonors: 128,
    totalAmount: 3856,
    todayDonors: 12,
    recentDonors: [
      { name: '匿名用户', amount: 50, method: '微信', time: '2分钟前' },
      { name: '开发者小王', amount: 20, method: '支付宝', time: '15分钟前' },
      { name: '热心用户', amount: 100, method: '比特币', time: '1小时前' },
      { name: '程序员小李', amount: 30, method: '以太坊', time: '2小时前' },
      { name: '技术爱好者', amount: 10, method: 'PayPal', time: '3小时前' },
    ]
  });

  const predefinedAmounts: DonationAmount[] = [
    { amount: 5, currency: 'CNY', symbol: '¥' },
    { amount: 10, currency: 'CNY', symbol: '¥' },
    { amount: 20, currency: 'CNY', symbol: '¥' },
    { amount: 50, currency: 'CNY', symbol: '¥' },
    { amount: 100, currency: 'CNY', symbol: '¥' },
    { amount: 200, currency: 'CNY', symbol: '¥' },
    { amount: 500, currency: 'CNY', symbol: '¥' },
  ];

  const donateMethods: DonateMethod[] = useMemo(() => [
    {
      id: 'wechat',
      type: 'wechat',
      name: '微信支付',
      icon: '💚',
      qr: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMDdDMTA2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9IjMwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNjUgNzVIMFYwSDY1Vjc1WiIgZmlsbD0iIzA3QzEwNiIvPgo8cGF0aCBkPSJNODUgNzVIMTUwVjE1MEg4NVY3NVoiIGZpbGw9IiMwN0MxMDYiLz4KPHRleHQgeD0iNzUiIHk9IjgwIiBmaWxsPSIjMDdDMTA2IiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+WjwvdGV4dD4KPC9zdmc+',
      account: 'wxp://f2f0-1234567890',
      color: '#07C160',
      description: '扫码或复制微信号'
    },
    {
      id: 'alipay',
      type: 'alipay',
      name: '支付宝',
      icon: '💙',
      qr: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMTY3N0ZGIi8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9IjMwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNjAgNzVIMFYwSDYwVjc1WiIgZmlsbD0iIzE2NzdGRiIvPgo8cGF0aCBkPSJNOTAgNzVIMTUwVjE1MEg5MFY3NVoiIGZpbGw9IiMxNjc3RkYiLz4KPHRleHQgeD0iNzUiIHk9IjgwIiBmaWxsPSIjMTY3N0ZGIiBmb250LXNpemU9IjIwIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Wlw8L3RleHQ+Cjwvc3ZnPg==',
      account: '2088123456789012',
      color: '#1677FF',
      description: '扫码或复制支付宝账号'
    },
    {
      id: 'bitcoin',
      type: 'crypto',
      name: '比特币',
      icon: '🟠',
      qr: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjc5MDhCIi8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9IjI1IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI3NSIgeT0iODAiIGZpbGw9IiNGNzkwOEMiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CVDwvdGV4dD4KPC9zdmc+',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      color: '#F7900C',
      description: '加密货币支付'
    },
    {
      id: 'ethereum',
      type: 'crypto',
      name: '以太坊',
      icon: '🔷',
      qr: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjNjI3RUU0Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9IjI1IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI3NSIgeT0iODAiIGZpbGw9IiM2MjdFRTQiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FVEg8L3RleHQ+Cjwvc3ZnPg==',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8',
      color: '#627EE4',
      description: '支持ETH及ERC-20代币'
    },
    {
      id: 'paypal',
      type: 'international',
      name: 'PayPal',
      icon: '💰',
      qr: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMDA5Q0QzIi8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9IjMwIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI3NSIgeT0iODAiIGZpbGw9IiMwMDlDRDMiIGZvbnQtc2l6ZT0iMjIiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QPC90ZXh0Pgo8L3N2Zz4=',
      account: 'developer@example.com',
      color: '#009CD3',
      description: '国际支付支持'
    },
    {
      id: 'bank',
      type: 'bank',
      name: '银行转账',
      icon: '🏦',
      qr: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRkY2QjAwIi8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9IjMwIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI3NSIgeT0iODAiIGZpbGw9IiNGRjZCMDAwIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8JCRhDwvdGV4dD4KPC9zdmc+',
      account: '6222 0000 0000 0000 000',
      color: '#FF6B00',
      description: '传统银行转账'
    }
  ], []);

  useEffect(() => {
    if (donateMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(donateMethods[0].id);
    }
  }, [selectedMethod]);

  useEffect(() => {
    const newTheme = themes[theme as keyof typeof themes];
    if (newTheme) {
      setCurrentTheme(newTheme);
    }
  }, [theme]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(0);
  };

  const getFinalAmount = () => {
    if (customAmount) {
      const num = parseFloat(customAmount);
      return isNaN(num) ? 0 : num;
    }
    return selectedAmount;
  };

  const shareDonation = () => {
    const text = `我刚刚支持了开发者工具集，你也来试试吧！这是一个非常实用的工具集合。`;
    if (navigator.share) {
      navigator.share({
        title: '支持开发者工具集',
        text: text,
      });
    }
  };

  const currentMethod = donateMethods.find(m => m.id === selectedMethod) || donateMethods[0];
  const finalAmount = getFinalAmount();

  // 确保currentTheme始终有值
  const safeTheme = currentTheme || themes.light;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: safeTheme.background,
      color: safeTheme.foreground,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* 导航栏 */}
      <ToolNavigation 
        theme={theme} 
        setTheme={setTheme} 
        currentTheme={safeTheme} 
      />

      {/* 主要内容 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
      }}>
        {/* 页面标题 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
        }}>
          <h1 style={{
            margin: '0 0 16px 0',
            fontSize: '36px',
            fontWeight: 'bold',
            color: safeTheme.foreground,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}>
            <span>💝</span>
            支持开发者
          </h1>
          <p style={{
            margin: 0,
            fontSize: '18px',
            color: safeTheme.placeholder,
            lineHeight: '1.6',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            如果这个工具对你有帮助，可以考虑请我喝杯咖啡☕
            <br />
            你的支持是我持续改进的动力！
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          marginBottom: '48px',
        }}>
          {/* 左侧：统计信息和金额选择 */}
          <div>
            {/* 统计信息卡片 */}
            <div style={{
              background: `linear-gradient(135deg, ${currentTheme.header} 0%, ${currentTheme.background} 100%)`,
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '32px',
              border: `1px solid ${safeTheme.border}`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}>
              <h2 style={{
                margin: '0 0 24px 0',
                fontSize: '20px',
                color: safeTheme.foreground,
                textAlign: 'center',
              }}>
                📊 打赏统计
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                textAlign: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: currentTheme.foreground, marginBottom: '8px' }}>
                    {donationStats.totalDonors}
                  </div>
                  <div style={{ fontSize: '14px', color: currentTheme.placeholder }}>总支持人数</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: currentTheme.foreground, marginBottom: '8px' }}>
                    ¥{donationStats.totalAmount}
                  </div>
                  <div style={{ fontSize: '14px', color: currentTheme.placeholder }}>累计支持</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: currentTheme.foreground, marginBottom: '8px' }}>
                    {donationStats.todayDonors}
                  </div>
                  <div style={{ fontSize: '14px', color: currentTheme.placeholder }}>今日支持</div>
                </div>
              </div>
            </div>

            {/* 金额选择 */}
            <div style={{
              backgroundColor: safeTheme.header,
              borderRadius: '16px',
              padding: '32px',
              border: `1px solid ${safeTheme.border}`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}>
              <h2 style={{
                margin: '0 0 24px 0',
                fontSize: '20px',
                color: safeTheme.foreground,
                textAlign: 'center',
              }}>
                💵 选择支持金额
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '20px',
              }}>
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount.amount}
                    onClick={() => handleAmountSelect(amount.amount)}
                    style={{
                      padding: '16px',
                      border: `2px solid ${selectedAmount === amount.amount ? currentMethod.color : currentTheme.border}`,
                      borderRadius: '12px',
                      backgroundColor: selectedAmount === amount.amount ? currentMethod.color : currentTheme.background,
                      color: selectedAmount === amount.amount ? 'white' : currentTheme.foreground,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      fontSize: '16px',
                      fontWeight: 'bold',
                    }}
                    onMouseOver={(e) => {
                      if (selectedAmount !== amount.amount) {
                        e.currentTarget.style.borderColor = currentMethod.color;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 4px 12px ${currentMethod.color}30`;
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedAmount !== amount.amount) {
                        e.currentTarget.style.borderColor = currentTheme.border;
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {amount.symbol}{amount.amount}
                  </button>
                ))}
              </div>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }}>
                <input
                  type="number"
                  placeholder="自定义金额"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    border: `1px solid ${safeTheme.border}`,
                    borderRadius: '12px',
                    backgroundColor: safeTheme.background,
                    color: safeTheme.foreground,
                    fontSize: '16px',
                  }}
                />
                <span style={{
                  color: safeTheme.placeholder,
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}>元</span>
              </div>
              {finalAmount > 0 && (
                <div style={{
                  marginTop: '16px',
                  textAlign: 'center',
                  fontSize: '18px',
                  color: safeTheme.foreground,
                }}>
                  将支持：<span style={{ color: currentMethod.color, fontWeight: 'bold' }}>¥{finalAmount}</span>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：支付方式选择 */}
          <div>
            <div style={{
              backgroundColor: safeTheme.header,
              borderRadius: '16px',
              padding: '32px',
              border: `1px solid ${safeTheme.border}`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}>
              <h2 style={{
                margin: '0 0 24px 0',
                fontSize: '20px',
                color: safeTheme.foreground,
                textAlign: 'center',
              }}>
                💳 选择支付方式
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '32px',
              }}>
                {donateMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    style={{
                      padding: '20px 16px',
                      border: `2px solid ${selectedMethod === method.id ? method.color : currentTheme.border}`,
                      borderRadius: '12px',
                      backgroundColor: selectedMethod === method.id ? `${method.color}15` : currentTheme.background,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseOver={(e) => {
                      if (selectedMethod !== method.id) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 4px 12px ${method.color}30`;
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedMethod !== method.id) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{ fontSize: '32px' }}>{method.icon}</div>
                    <div style={{
                      fontSize: '14px',
                      color: safeTheme.foreground,
                      fontWeight: 'bold',
                    }}>
                      {method.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: safeTheme.placeholder,
                    }}>
                      {method.description}
                    </div>
                  </button>
                ))}
              </div>

              {/* 当前选择的支付方式详情 */}
              <div style={{
                backgroundColor: safeTheme.background,
                border: `1px solid ${safeTheme.border}`,
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
              }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  fontSize: '18px',
                  color: safeTheme.foreground,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}>
                  <span>{currentMethod.icon}</span>
                  {currentMethod.name}
                  {finalAmount > 0 && (
                    <span style={{
                      backgroundColor: currentMethod.color,
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                    }}>
                      ¥{finalAmount}
                    </span>
                  )}
                </h3>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '24px',
                  flexWrap: 'wrap',
                }}>
                  <div>
                    <div style={{
                      marginBottom: '12px',
                      position: 'relative',
                      display: 'inline-block',
                    }}>
                      <img 
                        src={currentMethod.qr}
                        alt={currentMethod.name}
                        style={{
                          width: '200px',
                          height: '200px',
                          border: `2px solid ${currentMethod.color}`,
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                        }}
                        onClick={() => setShowQRLarge(!showQRLarge)}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '-8px',
                        right: '-8px',
                        backgroundColor: currentMethod.color,
                        color: 'white',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                      }}>
                        🔍
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    textAlign: 'left',
                    maxWidth: '300px',
                  }}>
                    <div style={{
                      marginBottom: '16px',
                      fontSize: '14px',
                      color: safeTheme.foreground,
                    }}>
                      <strong>{currentMethod.name}账号：</strong>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}>
                      <div style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: safeTheme.header,
                        border: `1px solid ${safeTheme.border}`,
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: safeTheme.placeholder,
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                      }}>
                        {currentMethod.account || currentMethod.address}
                      </div>
                      <button
                        onClick={() => copyToClipboard(currentMethod.account || currentMethod.address || '', currentMethod.id)}
                        style={{
                          backgroundColor: currentMethod.color,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.opacity = '0.8';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {copiedText === currentMethod.id ? '✓ 已复制' : '📋 复制'}
                      </button>
                    </div>
                    
                    {finalAmount > 0 && (
                      <div style={{
                        backgroundColor: `${currentMethod.color}15`,
                        border: `1px solid ${currentMethod.color}`,
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '14px',
                        color: safeTheme.foreground,
                      }}>
                        <strong>支持金额：</strong>¥{finalAmount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 功能按钮 */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: '48px',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={shareDonation}
            style={{
              backgroundColor: 'transparent',
              color: safeTheme.foreground,
              border: `1px solid ${safeTheme.border}`,
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.header;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            📤 分享给朋友
          </button>
          <button
            onClick={() => window.open('mailto:developer@example.com?subject=打赏反馈&body=我刚刚通过工具集进行了打赏，想反馈一下...')}
            style={{
              backgroundColor: 'transparent',
              color: safeTheme.foreground,
              border: `1px solid ${safeTheme.border}`,
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.header;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            📧 联系开发者
          </button>
        </div>

        {/* 最近支持者 */}
        <div style={{
          backgroundColor: safeTheme.header,
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '48px',
          border: `1px solid ${safeTheme.border}`,
        }}>
          <h2 style={{
            margin: '0 0 24px 0',
            fontSize: '20px',
            color: safeTheme.foreground,
            textAlign: 'center',
          }}>
            🏆 最近支持者
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
          }}>
            {donationStats.recentDonors.map((donor, index) => (
              <div key={index} style={{
                backgroundColor: safeTheme.background,
                border: `1px solid ${safeTheme.border}`,
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: currentTheme.button,
                  color: currentTheme.buttonForeground || 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}>
                  {donor.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: safeTheme.foreground,
                    marginBottom: '4px',
                  }}>
                    {donor.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: safeTheme.placeholder,
                  }}>
                    通过{donor.method}支持 ¥{donor.amount} · {donor.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div style={{
          backgroundColor: safeTheme.header,
          borderRadius: '16px',
          padding: '32px',
          border: `1px solid ${safeTheme.border}`,
        }}>
          <h2 style={{
            margin: '0 0 24px 0',
            fontSize: '20px',
            color: safeTheme.foreground,
            textAlign: 'center',
          }}>
            📋 使用说明
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            fontSize: '14px',
            color: safeTheme.placeholder,
            lineHeight: '1.6',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>✓</span>
              <span>扫描二维码或复制账号转账</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>✓</span>
              <span>支持任意金额，心意最重要</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>✓</span>
              <span>打赏后可定制功能或提交建议</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>✓</span>
              <span>资金用于服务器维护和开发</span>
            </div>
          </div>
        </div>

        {/* 感谢信息 */}
        <div style={{
          textAlign: 'center',
          fontSize: '16px',
          color: safeTheme.placeholder,
          marginTop: '48px',
        }}>
          <p style={{ margin: '0 0 12px 0' }}>
            💝 感谢每一位支持者的信任和鼓励！
          </p>
          <p style={{ margin: 0 }}>
            无论是否打赏，你都让我更有动力继续完善这个工具！
          </p>
        </div>
      </div>

      {/* 大图预览 */}
      {showQRLarge && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20000,
          cursor: 'pointer',
        }}
        onClick={() => setShowQRLarge(false)}
        >
          <img 
            src={currentMethod.qr}
            alt={currentMethod.name}
            style={{
              width: '500px',
              height: '500px',
              border: `4px solid ${currentMethod.color}`,
              borderRadius: '16px',
              backgroundColor: 'white',
            }}
          />
          <div style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            color: 'white',
            fontSize: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '12px 24px',
            borderRadius: '30px',
            cursor: 'pointer',
          }}>
            点击关闭
          </div>
        </div>
      )}
    </div>
  );
};

export default DonatePage;