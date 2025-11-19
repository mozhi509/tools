import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  FileJson, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Download,
  Eye,
  EyeOff,
  Trash2,
  Zap,
  ArrowLeftRight
} from 'lucide-react';

import { ChevronRight, ChevronDown } from 'lucide-react';

// 可折叠的JSON节点组件
const JsonNode = ({ data, level = 0, isLast = false, keyName = null }) => {
  const [isExpanded, setIsExpanded] = React.useState(level < 2);
  
  const renderValue = (value) => {
    if (value === null) return <span style={{ color: '#d73a49' }}>null</span>;
    if (value === undefined) return <span style={{ color: '#d73a49' }}>undefined</span>;
    if (typeof value === 'string') return <span style={{ color: '#032f62' }}>"{value}"</span>;
    if (typeof value === 'number') return <span style={{ color: '#005cc5' }}>{value}</span>;
    if (typeof value === 'boolean') return <span style={{ color: '#d73a49' }}>{value}</span>;
    return String(value);
  };
  
  if (data === null || data === undefined || typeof data !== 'object') {
    return (
      <div style={{ marginLeft: `${level * 20}px` }}>
        {keyName && (
          <>
            <span style={{ color: '#e36209' }}>"{keyName}"</span>
            <span>: </span>
          </>
        )}
        {renderValue(data)}
        {!isLast && <span>,</span>}
      </div>
    );
  }
  
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <div style={{ marginLeft: `${level * 20}px` }}>
          {keyName && (
            <>
              <span style={{ color: '#e36209' }}>"{keyName}"</span>
              <span>: </span>
            </>
          )}
          []
          {!isLast && <span>,</span>}
        </div>
      );
    }
    
    return (
      <div>
        <div 
          style={{ 
            marginLeft: `${level * 20}px`,
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {keyName && (
            <>
              <span style={{ color: '#e36209' }}>"{keyName}"</span>
              <span>: </span>
            </>
          )}
          {isExpanded ? (
            <ChevronDown size={14} style={{ marginRight: '4px' }} />
          ) : (
            <ChevronRight size={14} style={{ marginRight: '4px' }} />
          )}
          <span style={{ color: '#22863a' }}>[</span>
          {!isExpanded && (
            <span style={{ color: '#6a737d' }}>
              {data.length} items
            </span>
          )}
          <span style={{ color: '#22863a' }}>{isExpanded ? '' : ']'}</span>
          {!isExpanded && !isLast && <span>,</span>}
        </div>
        {isExpanded && (
          <>
            {data.map((item, index) => (
              <div key={index}>
                <JsonNode 
                  data={item} 
                  level={level + 1} 
                  isLast={index === data.length - 1}
                />
              </div>
            ))}
            <div style={{ marginLeft: `${level * 20}px` }}>
              <span style={{ color: '#22863a' }}>]</span>
              {!isLast && <span>,</span>}
            </div>
          </>
        )}
      </div>
    );
  }
  
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return (
      <div style={{ marginLeft: `${level * 20}px` }}>
        {keyName && (
          <>
            <span style={{ color: '#e36209' }}>"{keyName}"</span>
            <span>: </span>
          </>
        )}
        <span style={{ color: '#22863a' }}>{'{}'}</span>
        {!isLast && <span>,</span>}
      </div>
    );
  }
  
  return (
    <div>
      <div 
        style={{ 
          marginLeft: `${level * 20}px`,
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {keyName && (
          <>
            <span style={{ color: '#e36209' }}>"{keyName}"</span>
            <span>: </span>
          </>
        )}
        {isExpanded ? (
          <ChevronDown size={14} style={{ marginRight: '4px' }} />
        ) : (
          <ChevronRight size={14} style={{ marginRight: '4px' }} />
        )}
        <span style={{ color: '#22863a' }}>{'{'}</span>
        {!isExpanded && (
          <span style={{ color: '#6a737d' }}>
            {entries.length} keys
          </span>
        )}
        <span style={{ color: '#22863a' }}>{isExpanded ? '' : '}'}</span>
        {!isExpanded && !isLast && <span>,</span>}
      </div>
      {isExpanded && (
        <>
          {entries.map(([key, value], index) => (
            <div key={key}>
              <JsonNode 
                data={value} 
                level={level + 1} 
                keyName={key}
                isLast={index === entries.length - 1}
              />
            </div>
          ))}
          <div style={{ marginLeft: `${level * 20}px` }}>
            <span style={{ color: '#22863a' }}>}</span>
            {!isLast && <span>,</span>}
          </div>
        </>
      )}
    </div>
  );
};

// 可折叠的JSON显示组件
const CollapsibleJSON = ({ data }) => {
  
  // 解析JSON对象用于折叠显示
  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch {
    return (
      <div style={{ 
        fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
        fontSize: '0.9rem',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap',
        padding: '1rem',
        background: '#f8f9fa'
      }}>
        {data}
      </div>
    );
  }
  
  return (
    <div 
      style={{ 
        fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
        fontSize: '0.9rem',
        lineHeight: '1.5',
        padding: '6px 10px',
        background: '#f8f9fa',
        borderRadius: '0',
        overflow: 'auto'
      }}
    >
      <JsonNode data={jsonData} isLast={true} />
    </div>
  );
};

const JsonFormatter = () => {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [indent, setIndent] = useState(2);
  const [showRawOutput, setShowRawOutput] = useState(false);
  const [processing, setProcessing] = useState(false);

  const formatJson = async () => {
    if (!inputJson.trim()) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/tools/json/format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          json: inputJson,
          indent: indent 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setOutputJson(data.formatted);
        setIsValid(true);
      } else {
        setOutputJson('');
        setIsValid(false);
      }
    } catch (error) {
      setIsValid(false);
    } finally {
      setProcessing(false);
    }
  };

  const validateJson = async () => {
    if (!inputJson.trim()) {
      return;
    }

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
        setIsValid(data.valid);
      }
    } catch (error) {
    }
  };

  const minifyJson = async () => {
    if (!inputJson.trim()) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/tools/json/minify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ json: inputJson }),
      });

      const data = await response.json();
      
      if (data.success) {
        setOutputJson(data.minified);
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputJson);
    toast.success('已复制到剪贴板！');
  };

  const downloadJson = () => {
    const blob = new Blob([outputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  };

  const clearAll = () => {
    setInputJson('');
    setOutputJson('');
    setIsValid(null);
    toast.info('已清空所有内容');
  };

  const loadSample = () => {
    const sample = {
      "name": "Web工具集",
      "version": "1.0.0",
      "description": "一个功能强大的在线工具集合",
      "features": ["JSON格式化", "Base64编解码", "URL编解码"],
      "config": {
        "theme": "light",
        "language": "zh-CN"
      },
      "metrics": {
        "users": 1000,
        "tools": 6
      }
    };
    setInputJson(JSON.stringify(sample));
  };

  const swapInputOutput = () => {
    const temp = inputJson;
    setInputJson(outputJson);
    setOutputJson(temp);
  };

  return (
    <div className="json-tool-container">
      {/* 控制面板 */}
      <div className="tool-panel" style={{ marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <FileJson size={24} style={{ marginRight: '0.5rem', color: '#007bff' }} />
          <div className="btn-group" style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-primary"
            onClick={formatJson}
            disabled={processing}
          >
            {processing ? <Zap size={16} /> : <FileJson size={16} />}
            {processing ? '处理中...' : '格式化'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={validateJson}
          >
            <CheckCircle size={16} />
            验证
          </button>
          <button 
            className="btn btn-outline"
            onClick={minifyJson}
            disabled={processing}
          >
            <Zap size={16} />
            压缩
          </button>
          <button 
            className="btn btn-outline"
            onClick={swapInputOutput}
            disabled={!outputJson}
          >
            <ArrowLeftRight size={16} />
            交换
          </button>
          <button 
            className="btn btn-outline"
            onClick={loadSample}
          >
            <FileJson size={16} />
            加载示例
          </button>
          <button 
            className="btn btn-outline"
            onClick={clearAll}
          >
            <Trash2 size={16} />
            清空
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.9rem', color: '#6c757d' }}>
            缩进空格数:
          </label>
          <select 
            value={indent} 
            onChange={(e) => setIndent(Number(e.target.value))}
            style={{ 
              padding: '0.25rem 0.5rem', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }}
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={8}>8</option>
          </select>
        </div>
        </div>
      </div>

      {/* 左右布局的输入输出区域 */}
      <div className="json-formatter-layout">
        {/* 左侧输入区域 */}
        <div className="json-formatter-panel tool-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              输入JSON
              {isValid === false && (
                  <XCircle size={16} color="#dc3545" style={{ marginLeft: '0.5rem' }} />
              )}
            </h3>
          </div>
          <textarea
            className="form-control json-input"
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder='请输入JSON数据，例如: {"name": "张三", "age": 25}'
            style={{ 
              border: 'none',
              borderRadius: '0',
              resize: 'none',
              fontSize: '0.9rem'
            }}
          />
          <div style={{ 
            padding: '6px 10px', 
            borderTop: '1px solid #e9ecef',
            fontSize: '0.875rem', 
            color: '#6c757d',
            background: '#f8f9fa'
          }}>
            字符数: {inputJson.length} | 行数: {inputJson.split('\n').length}
          </div>
        </div>

        {/* 右侧输出区域 */}
        <div className="json-formatter-panel tool-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              格式化结果
              {isValid && outputJson && (
                <CheckCircle size={16} color="#28a745" style={{ marginLeft: '0.5rem' }} />
              )}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-outline"
                onClick={() => setShowRawOutput(!showRawOutput)}
                disabled={!outputJson}
              >
                {showRawOutput ? <EyeOff size={16} /> : <Eye size={16} />}
                {showRawOutput ? '折叠视图' : '语法高亮'}
              </button>
              <button 
                className="btn btn-outline"
                onClick={copyToClipboard}
                disabled={!outputJson}
              >
                <Copy size={16} />
                复制
              </button>
              <button 
                className="btn btn-outline"
                onClick={downloadJson}
                disabled={!outputJson}
              >
                <Download size={16} />
                下载
              </button>
            </div>
          </div>
          
          {outputJson ? (
            showRawOutput ? (
              <textarea
                className="form-control json-output"
                value={outputJson}
                readOnly
                style={{ 
                  border: 'none',
                  borderRadius: '0',
                  resize: 'none',
                  fontSize: '0.9rem'
                }}
              />
            ) : (
              <div className="json-output-container" style={{ height: '100%' }}>
                <CollapsibleJSON data={outputJson} />
              </div>
            )
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#6c757d',
              fontSize: '1.1rem',
              background: '#f8f9fa'
            }}>
              格式化结果将显示在这里...
            </div>
          )}
          
          {outputJson && (
            <div style={{ 
              padding: '6px 10px', 
              borderTop: '1px solid #e9ecef',
              fontSize: '0.875rem', 
              color: '#6c757d',
              background: '#f8f9fa'
            }}>
              字符数: {outputJson.length} | 行数: {outputJson.split('\n').length}
            </div>
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="tool-panel" style={{ marginTop: '6px' }}>
        <div className="panel-header">
          <h2 className="panel-title">使用说明</h2>
        </div>
        <div style={{ color: '#6c757d', lineHeight: '1.6' }}>
          <p><strong>JSON格式化工具功能：</strong></p>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>格式化：将压缩的JSON数据格式化为易读的缩进格式</li>
            <li>验证：检查JSON数据格式是否正确</li>
            <li>压缩：将格式化的JSON数据压缩为一行</li>
            <li>交换：快速交换输入和输出内容</li>
            <li>复制：一键复制格式化后的JSON数据</li>
            <li>下载：将格式化后的JSON数据保存为文件</li>
          </ul>
          <p><strong>快捷操作：</strong></p>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>支持自定义缩进空格数（2、4、8）</li>
            <li>提供语法高亮显示，更易阅读</li>
            <li>实时显示字符数和行数统计</li>
            <li>提供示例数据，方便快速测试</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JsonFormatter;