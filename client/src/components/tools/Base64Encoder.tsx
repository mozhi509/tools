import React, { useState } from 'react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';

const Base64Encoder: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const currentTheme = getThemeColors('vs-light');




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
      <ToolNavigation 
        currentTheme={currentTheme}
      />
      
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