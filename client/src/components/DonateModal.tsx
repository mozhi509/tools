import React from 'react';
import { useState, useEffect } from 'react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: any;
}

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

const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose, theme }) => {
  const [copiedText, setCopiedText] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [showQRLarge, setShowQRLarge] = useState<boolean>(false);
  const [donationStats, setDonationStats] = useState({
    totalDonors: 128,
    totalAmount: 3856,
    todayDonors: 12
  });

  const predefinedAmounts: DonationAmount[] = [
    { amount: 5, currency: 'CNY', symbol: '¥' },
    { amount: 10, currency: 'CNY', symbol: '¥' },
    { amount: 20, currency: 'CNY', symbol: '¥' },
    { amount: 50, currency: 'CNY', symbol: '¥' },
    { amount: 100, currency: 'CNY', symbol: '¥' },
    { amount: 200, currency: 'CNY', symbol: '¥' },
  ];

  const donateMethods: DonateMethod[] = [
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
      qr: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjcwOTECIi8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9IjI1IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI3NSIgeT0iODAiIGZpbGw9IiNGNzA5MEMiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CVDwvdGV4dD4KPC9zdmc+',
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
  ];

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

  useEffect(() => {
    if (donateMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(donateMethods[0].id);
    }
  }, []);

  if (!isOpen) return null;

  const currentMethod = donateMethods.find(m => m.id === selectedMethod) || donateMethods[0];
  const finalAmount = getFinalAmount();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        backgroundColor: theme.background,
        border: `1px solid ${theme.border}`,
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '900px',
        width: '95%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      }}>
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: theme.placeholder,
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.3s',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = theme.border;
            e.currentTarget.style.color = theme.foreground;
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.placeholder;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>

        {/* 头部统计信息 */}
        <div style={{
          background: `linear-gradient(135deg, ${theme.header} 0%, ${theme.background} 100%)`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: `1px solid ${theme.border}`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.foreground, marginBottom: '4px' }}>
                {donationStats.totalDonors}
              </div>
              <div style={{ fontSize: '12px', color: theme.placeholder }}>总支持人数</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.foreground, marginBottom: '4px' }}>
                ¥{donationStats.totalAmount}
              </div>
              <div style={{ fontSize: '12px', color: theme.placeholder }}>累计支持金额</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.foreground, marginBottom: '4px' }}>
                {donationStats.todayDonors}
              </div>
              <div style={{ fontSize: '12px', color: theme.placeholder }}>今日支持</div>
            </div>
          </div>
        </div>

        {/* 标题 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '28px',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 'bold',
            color: theme.foreground,
            marginBottom: '12px',
          }}>
            🎉 支持开发者
          </h2>
          <p style={{
            margin: 0,
            fontSize: '16px',
            color: theme.placeholder,
            lineHeight: '1.6',
          }}>
            如果这个工具对你有帮助，可以考虑请我喝杯咖啡☕
            <br />
            你的支持是我持续改进的动力！
          </p>
        </div>

        {/* 金额选择 */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            color: theme.foreground,
            textAlign: 'center',
          }}>
            💵 选择支持金额
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '12px',
            marginBottom: '16px',
          }}>
            {predefinedAmounts.map((amount) => (
              <button
                key={amount.amount}
                onClick={() => handleAmountSelect(amount.amount)}
                style={{
                  padding: '12px',
                  border: `2px solid ${selectedAmount === amount.amount ? currentMethod.color : theme.border}`,
                  borderRadius: '8px',
                  backgroundColor: selectedAmount === amount.amount ? currentMethod.color : theme.background,
                  color: selectedAmount === amount.amount ? 'white' : theme.foreground,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
                onMouseOver={(e) => {
                  if (selectedAmount !== amount.amount) {
                    e.currentTarget.style.borderColor = currentMethod.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedAmount !== amount.amount) {
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.transform = 'translateY(0)';
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
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                backgroundColor: theme.background,
                color: theme.foreground,
                fontSize: '14px',
              }}
            />
            <span style={{
              color: theme.placeholder,
              fontSize: '14px',
            }}>元</span>
          </div>
        </div>

        {/* 支付方式选择 */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            color: theme.foreground,
            textAlign: 'center',
          }}>
            💳 选择支付方式
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}>
            {donateMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                style={{
                  padding: '16px 12px',
                  border: `2px solid ${selectedMethod === method.id ? method.color : theme.border}`,
                  borderRadius: '12px',
                  backgroundColor: selectedMethod === method.id ? `${method.color}15` : theme.background,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${method.color}30`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '24px' }}>{method.icon}</div>
                <div style={{
                  fontSize: '12px',
                  color: theme.foreground,
                  fontWeight: 'bold',
                }}>
                  {method.name}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: theme.placeholder,
                }}>
                  {method.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 当前选择的支付方式详情 */}
        <div style={{
          backgroundColor: theme.header,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            color: theme.foreground,
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
                    width: '180px',
                    height: '180px',
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
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
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
                color: theme.foreground,
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
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: theme.placeholder,
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
                  color: theme.foreground,
                }}>
                  <strong>支持金额：</strong>¥{finalAmount}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 功能按钮 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={shareDonation}
            style={{
              backgroundColor: 'transparent',
              color: theme.foreground,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = theme.header;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            📤 分享给朋友
          </button>
          <button
            onClick={() => window.open('mailto:developer@example.com?subject=打赏反馈&body=我刚刚通过工具集进行了打赏，想反馈一下...')}
            style={{
              backgroundColor: 'transparent',
              color: theme.foreground,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = theme.header;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            📧 联系开发者
          </button>
        </div>

        {/* 说明 */}
        <div style={{
          backgroundColor: theme.header,
          border: `1px solid ${theme.border}`,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            color: theme.foreground,
          }}>
            📋 使用说明：
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
            fontSize: '12px',
            color: theme.placeholder,
            lineHeight: '1.6',
          }}>
            <div>✓ 扫描二维码或复制账号转账</div>
            <div>✓ 支持任意金额，心意最重要</div>
            <div>✓ 打赏后可定制功能或提交建议</div>
            <div>✓ 资金用于服务器维护和开发</div>
          </div>
        </div>

        {/* 感谢信息 */}
        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: theme.placeholder,
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
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
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
              width: '400px',
              height: '400px',
              border: `4px solid ${currentMethod.color}`,
              borderRadius: '16px',
              backgroundColor: 'white',
            }}
          />
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            color: 'white',
            fontSize: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '8px 16px',
            borderRadius: '20px',
          }}>
            点击关闭
          </div>
        </div>
      )}
    </div>
  );
};

export default DonateModal;