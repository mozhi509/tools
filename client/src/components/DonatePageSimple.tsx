import React, { useState } from 'react';
import ToolNavigation from './ToolNavigation';

const DonatePageSimple: React.FC = () => {
  const [theme, setTheme] = useState('vs-light');

  const currentTheme = {
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
  };

  const donateMethods = [
    {
      id: 'wechat',
      name: '',
      icon: '',
      account: '微信扫码支付',
      qrImage: '/webchat.jpg',
      color: '#07C160'
    },
    {
      id: 'alipay',
      name: '',
      icon: '',
      account: '支付宝扫码支付',
      qrImage: '/alipay.jpg',
      color: '#1677FF'
    }
  ];



  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: currentTheme.background,
      color: currentTheme.foreground,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <ToolNavigation 
        theme={theme} 
        setTheme={setTheme} 
        currentTheme={currentTheme} 
      />

      <div style={{
        maxWidth: '800px',
        margin: '20px auto',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '50px'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 0 15px 0',
            color: '#6F4E37', // 咖啡棕色
            fontFamily: 'Georgia, serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ fontSize: '32px' }}>☕</span>
            <span>Buy Me a Coffee</span>
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: '#8B7355', // 浅咖啡色
            margin: '0 0 10px 0',
            fontStyle: 'italic'
          }}>
            "A cup of coffee keeps the code running"
          </p>
          
          <p style={{
            fontSize: '16px',
            color: currentTheme.placeholder,
            margin: '0',
            lineHeight: '1.5'
          }}>
            你的每一份支持，都是我继续创作的动力
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '50px',
          marginBottom: '60px',
          maxWidth: '700px',
          margin: '0 auto 60px'
        }}>
          {donateMethods.map((method) => (
            <div
              key={method.id}
              style={{
                padding: '40px 30px',
                background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)', // 咖啡奶色渐变
                borderRadius: '20px',
                border: '3px solid #D4A574', // 咖啡边框色
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '25px',
                boxShadow: '0 8px 32px rgba(111, 78, 55, 0.15)', // 咖啡色阴影
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* 咖啡杯装饰 */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                fontSize: '40px',
                opacity: '0.3',
                transform: 'rotate(15deg)'
              }}>
                ☕
              </div>
              

              
              {method.qrImage && (
                <div style={{
                  backgroundColor: 'white',
                  padding: '25px',
                  borderRadius: '15px',
                  boxShadow: '0 4px 20px rgba(111, 78, 55, 0.2)',
                  border: '2px solid #E6D5BC', // 浅咖啡边框
                }}>
                  <img 
                    src={method.qrImage}
                    alt={method.name}
                    style={{
                      width: '180px',
                      height: '180px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '1px solid #D4A574'
                    }}
                  />
                  
                  {/* 简洁文字说明 */}
                  <div style={{
                    textAlign: 'center',
                    marginTop: '15px',
                    padding: '10px 8px',
                    background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D5C4 100%)',
                    borderRadius: '8px',
                    border: '1px solid #D4A574'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      color: '#6F4E37',
                      fontWeight: '500',
                      lineHeight: '1.4'
                    }}>
                      {method.id === 'wechat' 
                        ? '微信扫码，香浓一杯'
                        : '支付宝，甘醇心意'
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* 咖啡豆装饰 */}
        <div style={{
          textAlign: 'center',
          color: '#8B7355',
          fontSize: '16px',
          marginTop: '40px',
          whiteSpace: 'nowrap',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px'
        }}>
          <span style={{ fontSize: '20px' }}>🫘</span>
          <span style={{ whiteSpace: 'nowrap' }}>每一份支持，都是最好的提神咖啡豆</span>
          <span style={{ fontSize: '20px' }}>🫘</span>
        </div>


      </div>
    </div>
  );
};

export default DonatePageSimple;