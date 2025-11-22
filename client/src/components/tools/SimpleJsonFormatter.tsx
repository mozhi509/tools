import React, { useState } from 'react';

const SimpleJsonFormatter: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>('');
  const [outputJson, setOutputJson] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const formatJson = async (): Promise<void> => {
    if (!inputJson.trim()) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/tools/json/format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          json: inputJson,
          indent: 2 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setOutputJson(data.formatted || '');
        setIsValid(true);
      } else {
        setOutputJson(data.error || '格式化失败');
        setIsValid(false);
      }
    } catch (error) {
      setOutputJson('网络连接错误');
      setIsValid(false);
    } finally {
      setProcessing(false);
    }
  };

  const validateJson = async (): Promise<void> => {
    if (!inputJson.trim()) return;

    try {
      const response = await fetch('/api/tools/json/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ json: inputJson }),
      });

      const data = await response.json();
      if (data.success) {
        setIsValid(data.valid || false);
      }
    } catch (error) {
      console.error('验证错误:', error);
    }
  };

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(outputJson);
    alert('已复制到剪贴板');
  };

  const clearAll = (): void => {
    setInputJson('');
    setOutputJson('');
    setIsValid(null);
  };

  const loadSample = (): void => {
    const sample = {
      "name": "Web工具集",
      "version": "1.0.0",
      "description": "一个功能强大的在线工具集合",
      "features": ["JSON格式化", "Base64编解码", "URL编解码"],
      "config": {
        "theme": "light",
        "language": "zh-CN"
      }
    };
    setInputJson(JSON.stringify(sample));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          color: '#007bff',
          marginBottom: '20px'
        }}>
          📄 JSON 格式化工具
        </h2>
        
        {/* 控制按钮 */}
        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={formatJson}
            disabled={processing}
            style={{
              padding: '8px 16px',
              background: processing ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: processing ? 'not-allowed' : 'pointer'
            }}
          >
            {processing ? '⚡ 处理中...' : '📄 格式化'}
          </button>
          
          <button 
            onClick={validateJson}
            style={{
              padding: '8px 16px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ✅ 验证
          </button>
          
          <button 
            onClick={loadSample}
            style={{
              padding: '8px 16px',
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📄 加载示例
          </button>
          
          <button 
            onClick={copyToClipboard}
            disabled={!outputJson}
            style={{
              padding: '8px 16px',
              background: outputJson ? '#6c757d' : '#e9ecef',
              color: outputJson ? 'white' : '#6c757d',
              border: 'none',
              borderRadius: '4px',
              cursor: outputJson ? 'pointer' : 'not-allowed'
            }}
          >
            📋 复制
          </button>
          
          <button 
            onClick={clearAll}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🗑️ 清空
          </button>
        </div>

        {/* 状态指示器 */}
        {isValid !== null && (
          <div style={{ 
            padding: '10px', 
            marginBottom: '15px',
            borderRadius: '4px',
            background: isValid ? '#d4edda' : '#f8d7da',
            color: isValid ? '#155724' : '#721c24',
            border: `1px solid ${isValid ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {isValid ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✅ JSON格式正确 ✓
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                ❌ JSON格式错误 ✗
              </span>
            )}
          </div>
        )}

        {/* 输入输出区域 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* 输入区域 */}
          <div>
            <h3 style={{ marginBottom: '10px' }}>输入 JSON:</h3>
            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder='请输入JSON数据，例如: {"name": "张三", "age": 25}'
              style={{
                width: '100%',
                height: '300px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'Monaco, Menlo, monospace',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            <div style={{ 
              marginTop: '5px', 
              fontSize: '12px', 
              color: '#6c757d' 
            }}>
              字符数: {inputJson.length} | 行数: {inputJson.split('\n').length}
            </div>
          </div>

          {/* 输出区域 */}
          <div>
            <h3 style={{ marginBottom: '10px' }}>格式化结果:</h3>
            {outputJson ? (
              <>
                <textarea
                  value={outputJson}
                  readOnly
                  style={{
                    width: '100%',
                    height: '300px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'Monaco, Menlo, monospace',
                    fontSize: '14px',
                    resize: 'vertical',
                    background: '#f8f9fa'
                  }}
                />
                <div style={{ 
                  marginTop: '5px', 
                  fontSize: '12px', 
                  color: '#6c757d' 
                }}>
                  字符数: {outputJson.length} | 行数: {outputJson.split('\n').length}
                </div>
              </>
            ) : (
              <div style={{
                width: '100%',
                height: '300px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6c757d',
                background: '#f8f9fa'
              }}>
                格式化结果将显示在这里...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleJsonFormatter;