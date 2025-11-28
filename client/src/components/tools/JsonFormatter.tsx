import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, X, Share2 } from 'lucide-react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';

interface JsonTab {
  id: string;
  name: string;
  content: string;
  output: string;
  minified: string;
  isValid: boolean | null;
  validationError: string;
  showOutput: boolean;
  showMinified: boolean;
  expandedNodes: Set<string>;
  lastModified: number;
  isEditing: boolean;
  viewMode: 'tree' | 'text'; // 新增视图模式
}

const JsonFormatter: React.FC = () => {
  const { shareId } = useParams<{ shareId?: string }>();
  const [tabs, setTabs] = useState<JsonTab[]>([
    {
      id: '1',
      name: 'Untitled-1.json',
      content: '',
      output: '',
      minified: '',
      isValid: null,
      validationError: '',
      showOutput: true,
      showMinified: false,
      expandedNodes: new Set(),
      lastModified: Date.now(),
      isEditing: false,
      viewMode: 'tree'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [processing, setProcessing] = useState<boolean>(false);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [theme, setTheme] = useState<string>('vs-light');
  const [shareLoading, setShareLoading] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  // 页面加载时从localStorage恢复设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('json-formatter-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    const savedIndentSize = localStorage.getItem('json-formatter-indent');
    if (savedIndentSize) {
      setIndentSize(parseInt(savedIndentSize, 10));
    }
  }, []);

  // 主题变化时保存到localStorage
  useEffect(() => {
    localStorage.setItem('json-formatter-theme', theme);
  }, [theme]);

  // 空格变化时保存到localStorage
  useEffect(() => {
    localStorage.setItem('json-formatter-indent', indentSize.toString());
  }, [indentSize]);

  // 标签页管理函数
  const createNewTab = () => {
    const newTab: JsonTab = {
      id: Date.now().toString(),
      name: `Untitled-${tabs.length + 1}.json`,
      content: '',
      output: '',
      minified: '',
      isValid: null,
      validationError: '',
      showOutput: true,
      showMinified: false,
      expandedNodes: new Set(),
      lastModified: Date.now(),
      isEditing: false,
      viewMode: 'tree'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // 保留至少一个标签页
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    // 如果关闭的是当前激活的标签页，切换到最后一个标签页
    if (tabId === activeTabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const updateTab = (tabId: string, updates: Partial<JsonTab>) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, ...updates, lastModified: Date.now() }
        : tab
    ));
  };

  const renameTab = (tabId: string, newName: string) => {
    updateTab(tabId, { name: newName || 'Untitled.json' });
  };

  const handleTabClick = (tabId: string) => {
    // 如果是编辑模式，不处理点击
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.isEditing) {
      return;
    }
    
    // 如果点击的是当前激活的标签页且不在编辑模式，不做处理
    if (tabId === activeTabId) {
      return;
    }
    
    setActiveTabId(tabId);
  };

  const handleTabDoubleClick = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // 启用编辑模式
    updateTab(tabId, { isEditing: true });
  };

  const handleTabNameBlur = (tabId: string, newName: string) => {
    updateTab(tabId, { 
      name: newName.trim() || `Untitled-${tabId}.json`,
      isEditing: false 
    });
  };

  const handleTabNameKeyDown = (tabId: string, e: React.KeyboardEvent, newName: string) => {
    if (e.key === 'Enter') {
      updateTab(tabId, { 
        name: newName.trim() || `Untitled-${tabId}.json`,
        isEditing: false 
      });
    } else if (e.key === 'Escape') {
      // 取消编辑，恢复原名
      const tab = tabs.find(t => t.id === tabId);
      if (tab) {
        updateTab(tabId, { isEditing: false });
      }
    }
  };

  const formatJson = async () => {
    if (!activeTab.content.trim()) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/tools/json/format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          json: activeTab.content,
          indent: indentSize 
        }),
      });

      const data = await response.json();
      
      if (data.success && data.formatted) {
        updateTab(activeTabId, {
          output: data.formatted,
          showOutput: true,
          showMinified: false,
          isValid: true,
          validationError: '',
          expandedNodes: new Set(['root'])
        });
      } else {
        updateTab(activeTabId, {
          output: data.error || '格式化失败',
          isValid: false,
          validationError: data.error || ''
        });
      }
    } catch (error) {
      updateTab(activeTabId, {
        output: '网络连接错误',
        isValid: false,
        validationError: '网络连接错误'
      });
    } finally {
      setProcessing(false);
    }
  };

  const validateJson = async () => {
    if (!activeTab.content.trim()) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/tools/json/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ json: activeTab.content }),
      });

      const data = await response.json();
      
      if (data.success) {
        updateTab(activeTabId, {
          isValid: data.valid,
          validationError: data.error || ''
        });
      } else {
        updateTab(activeTabId, {
          isValid: false,
          validationError: data.error || '验证失败'
        });
      }
    } catch (error) {
      updateTab(activeTabId, {
        isValid: false,
        validationError: '网络连接错误'
      });
    } finally {
      setProcessing(false);
    }
  };

  const minifyJson = async () => {
    if (!activeTab.content.trim()) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/tools/json/minify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ json: activeTab.content }),
      });

      const data = await response.json();
      
      if (data.success && data.minified) {
        updateTab(activeTabId, {
          minified: data.minified,
          showOutput: false,
          showMinified: true,
          isValid: true,
          validationError: '',
          expandedNodes: new Set()
        });
      } else {
        updateTab(activeTabId, {
          minified: data.error || '压缩失败',
          isValid: false,
          validationError: data.error || ''
        });
      }
    } catch (error) {
      updateTab(activeTabId, {
        minified: '网络连接错误',
        isValid: false,
        validationError: '网络连接错误'
      });
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // 2秒后重置状态
    } catch (error) {
      alert('复制失败');
    }
  };

  const shareJson = async () => {
    if (!activeTab.content.trim()) {
      alert('请先输入 JSON 数据');
      return;
    }

    setShareLoading(true);
    try {
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: activeTab.content,
          output: activeTab.showOutput ? activeTab.output : '',
          minified: activeTab.showMinified ? activeTab.minified : '',
          showOutput: activeTab.showOutput,
          showMinified: activeTab.showMinified,
          viewMode: activeTab.viewMode,
          expandedNodes: Array.from(activeTab.expandedNodes),
          isValid: activeTab.isValid,
          validationError: activeTab.validationError
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setShareUrl(result.shareUrl);
        setShowShareModal(true);
      } else {
        alert('生成分享链接失败');
      }
    } catch (error) {
      console.error('分享失败:', error);
      alert('分享失败，请检查网络连接');
    } finally {
      setShareLoading(false);
    }
  };

  const loadSharedJson = async (shareId: string) => {
    try {
      const response = await fetch(`/api/share/${shareId}`);
      const result = await response.json();
      
      if (result.success) {
        // 创建新标签页加载分享的内容
        const sharedData = result.data;
        const jsonContent = typeof sharedData === 'string' ? sharedData : (sharedData.content || '');
        
        let formattedOutput = '';
        let isValid = true;
        let validationError = '';
        
        // 自动格式化 JSON 数据
        try {
          const parsed = JSON.parse(jsonContent);
          formattedOutput = JSON.stringify(parsed, null, 2);
          isValid = true;
          validationError = '';
        } catch (e) {
          formattedOutput = jsonContent;
          isValid = false;
          validationError = e instanceof Error ? e.message : 'JSON 格式错误';
        }
        
        const newTab: JsonTab = {
          id: Date.now().toString(),
          name: `Shared-${shareId}.json`,
          content: jsonContent,
          output: formattedOutput,
          minified: typeof sharedData === 'object' ? (sharedData.minified || '') : '',
          isValid: isValid,
          validationError: validationError,
          showOutput: true,
          showMinified: false,
          expandedNodes: typeof sharedData === 'object' ? new Set(sharedData.expandedNodes || ['root']) : new Set(['root']),
          lastModified: Date.now(),
          isEditing: false,
          viewMode: 'tree'
        };
        
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
      }
    } catch (error) {
      console.error('加载分享数据失败:', error);
    }
  };

  // 检查 URL 中是否有分享 ID（优先使用路径参数，也支持查询参数）
  useEffect(() => {
    if (shareId) {
      loadSharedJson(shareId);
    } else {
      // 如果没有路径参数，检查查询参数作为后备
      const urlParams = new URLSearchParams(window.location.search);
      const queryShareId = urlParams.get('share');
      if (queryShareId) {
        loadSharedJson(queryShareId);
      }
    }
  }, [shareId]);



  const renderJsonTree = (data: any, path: string = '', indent: number = 0, expandedNodes?: Set<string>, onToggle?: (path: string) => void): React.ReactNode => {
    if (data === null) {
      return <span style={{ color: currentTheme.boolean }}>null</span>;
    }
    
    if (data === undefined) {
      return <span style={{ color: currentTheme.boolean }}>undefined</span>;
    }
    
    if (typeof data === 'string') {
      return <span style={{ color: currentTheme.string }}>"{data}"</span>;
    }
    
    if (typeof data === 'number') {
      return <span style={{ color: currentTheme.number }}>{data}</span>;
    }
    
    if (typeof data === 'boolean') {
      return <span style={{ color: currentTheme.boolean }}>{String(data)}</span>;
    }
    
    if (Array.isArray(data)) {
      const isExpanded = expandedNodes?.has(path);
      const isEmpty = data.length === 0;
      
      return (
        <span>
          <span style={{ color: currentTheme.bracket }}>[</span>
          {!isEmpty && (
            <button
              onClick={() => onToggle?.(path)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: currentTheme.foreground,
                cursor: 'pointer',
                padding: '0 4px',
                fontSize: '12px',
                marginLeft: '4px',
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!isExpanded && !isEmpty && (
            <>
              <span style={{ color: currentTheme.placeholder, fontSize: '12px', margin: '0 4px' }}>
                {data.length} items
              </span>
              <span style={{ color: currentTheme.bracket }}>]</span>
            </>
          )}
          {isEmpty && <span style={{ color: currentTheme.comma }}>]</span>}
          
          {isExpanded && !isEmpty && (
            <div style={{ marginLeft: `${(indent + 1) * indentSize * 4}px` }}>
              {data.map((item, index) => (
                <div key={index}>
                  {renderJsonTree(item, `${path}[${index}]`, indent + 1, expandedNodes, onToggle)}
                  {index < data.length - 1 && <span style={{ color: currentTheme.comma }}>,</span>}
                </div>
              ))}
              <div style={{ color: currentTheme.bracket }}>]</div>
            </div>
          )}
        </span>
      );
    }
    
    if (typeof data === 'object') {
      const isExpanded = expandedNodes?.has(path);
      const entries = Object.entries(data);
      const isEmpty = entries.length === 0;
      
      return (
        <span>
          <span style={{ color: currentTheme.bracket }}>{'{'}</span>
          {!isEmpty && (
            <button
              onClick={() => onToggle?.(path)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: currentTheme.foreground,
                cursor: 'pointer',
                padding: '0 4px',
                fontSize: '12px',
                marginLeft: '4px',
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!isExpanded && !isEmpty && (
            <>
              <span style={{ color: currentTheme.placeholder, fontSize: '12px', margin: '0 4px' }}>
                {entries.length} properties
              </span>
              <span style={{ color: currentTheme.bracket }}>{'}'}</span>
            </>
          )}
          {isEmpty && <span style={{ color: currentTheme.comma }}>{'}'}</span>}
          
          {isExpanded && !isEmpty && (
            <div style={{ marginLeft: `${(indent + 1) * indentSize * 4}px` }}>
              {entries.map(([key, value], index) => (
                <div key={key}>
                  <span style={{ color: currentTheme.key }}>"{key}"</span>
                  <span style={{ color: currentTheme.comma }}>: </span>
                  {renderJsonTree(value, `${path}.${key}`, indent + 1, expandedNodes, onToggle)}
                  {index < entries.length - 1 && <span style={{ color: currentTheme.comma }}>,</span>}
                </div>
              ))}
              <div style={{ color: currentTheme.bracket }}>{'}'}</div>
            </div>
          )}
        </span>
      );
    }
    
    return null;
  };

  const downloadFile = (content: string, filename: string): void => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    const exampleJson = {
      "name": "John Doe",
      "age": 30,
      "email": "john.doe@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "country": "USA",
        "coordinates": {
          "lat": 40.7128,
          "lng": -74.0060
        }
      },
      "hobbies": ["reading", "swimming", "coding"],
      "isStudent": false,
      "scores": [85, 92, 78, 96],
      "metadata": {
        "created": "2024-01-15T10:30:00Z",
        "updated": "2024-01-20T14:45:00Z",
        "version": 1.2
      }
    };
    
    updateTab(activeTabId, {
      content: JSON.stringify(exampleJson),
      output: '',
      minified: '',
      isValid: null,
      validationError: '',
      showOutput: true,
      showMinified: false,
      expandedNodes: new Set()
    });
  };

  const clearAll = () => {
    updateTab(activeTabId, {
      content: '',
      output: '',
      minified: '',
      isValid: null,
      validationError: '',
      showOutput: true,
      showMinified: false,
      expandedNodes: new Set()
    });
  };

  const currentTheme = getThemeColors(theme);

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
        theme={theme}
        setTheme={setTheme}
        currentTheme={currentTheme}
      />
      
      {/* 工具标题栏和标签页 */}
      <div style={{
        backgroundColor: currentTheme.header,
        borderBottom: `1px solid ${currentTheme.border}`,
      }}>
        {/* 标题栏 */}
        <div style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'normal' }}>
            JSON 格式化工具
          </h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {shareUrl && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  style={{
                    backgroundColor: currentTheme.background,
                    color: currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    width: '200px',
                  }}
                />
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  style={{
                    backgroundColor: currentTheme.button,
                    color: currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  复制链接
                </button>
              </div>
            )}
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.foreground,
                border: `1px solid ${currentTheme.border}`,
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value={2}>2 空格</option>
              <option value={4}>4 空格</option>
              <option value={8}>8 空格</option>
            </select>
            <button
              onClick={() => clearAll()}
              style={{
                backgroundColor: currentTheme.border,
                color: currentTheme.foreground,
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              清空当前
            </button>
          </div>
        </div>
        
        {/* 标签页栏 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px 0 16px',
          backgroundColor: currentTheme.header,
          borderTop: `1px solid ${currentTheme.border}`,
          minHeight: '36px',
        }}>
          {/* 标签页 */}
          <div style={{ display: 'flex', flex: 1, overflow: 'auto' }}>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  backgroundColor: tab.id === activeTabId 
                    ? currentTheme.background 
                    : 'transparent',
                  border: tab.id === activeTabId 
                    ? `1px solid ${currentTheme.border}` 
                    : '1px solid transparent',
                  borderBottom: tab.id === activeTabId 
                    ? `1px solid ${currentTheme.background}` 
                    : 'none',
                  borderRadius: '4px 4px 0 0',
                  marginRight: '2px',
                  cursor: 'pointer',
                  minWidth: '120px',
                  maxWidth: '200px',
                  position: 'relative',
                }}
                onClick={() => handleTabClick(tab.id)}
                onDoubleClick={(e) => handleTabDoubleClick(tab.id, e)}
              >
                {tab.isEditing ? (
                  <input
                    type="text"
                    data-tab-id={tab.id}
                    value={tab.name}
                    onChange={(e) => renameTab(tab.id, e.target.value)}
                    onBlur={(e) => handleTabNameBlur(tab.id, e.target.value)}
                    onKeyDown={(e) => handleTabNameKeyDown(tab.id, e, e.currentTarget.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: currentTheme.foreground,
                      fontSize: '13px',
                      outline: 'none',
                      width: '100%',
                      cursor: 'text',
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    style={{
                      color: currentTheme.foreground,
                      fontSize: '13px',
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={tab.name}
                  >
                    {tab.name}
                  </span>
                )}
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    style={{
                      marginLeft: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: currentTheme.placeholder,
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = currentTheme.foreground;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = currentTheme.placeholder;
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* 新建标签页按钮 */}
          <button
            onClick={createNewTab}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: currentTheme.placeholder,
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = currentTheme.foreground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = currentTheme.placeholder;
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        padding: '16px',
        gap: '16px',
        overflow: 'hidden',
      }}>
        {/* Input Section */}
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
            fontSize: '14px',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={loadExample}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                示例
              </button>
              <button
                onClick={validateJson}
                disabled={processing}
                style={{
                  backgroundColor: activeTab.isValid === true ? '#238636' : activeTab.isValid === false ? '#da3633' : currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                {processing ? '处理中...' : '验证'}
              </button>
            </div>
          </div>
          <textarea
            value={activeTab.content}
            onChange={(e) => updateTab(activeTabId, { content: e.target.value })}
            placeholder="在此输入 JSON 数据..."
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
          {activeTab.validationError && (
            <div style={{
              padding: '12px',
              backgroundColor: '#da3633',
              color: 'white',
              fontSize: '12px',
            }}>
              {activeTab.validationError}
            </div>
          )}
        </div>

        {/* Output Section */}
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
            fontSize: '14px',
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {(activeTab.showOutput || activeTab.showMinified) && (
                <button
                  onClick={() => updateTab(activeTabId, { 
                    viewMode: activeTab.viewMode === 'tree' ? 'text' : 'tree' 
                  })}
                  style={{
                    backgroundColor: theme === 'vs-high-contrast' ? currentTheme.button : currentTheme.border,
                    color: currentTheme.buttonForeground || currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {activeTab.viewMode === 'tree' ? '文本视图' : '树形视图'}
                </button>
              )}
              {activeTab.viewMode === 'tree' && (activeTab.showOutput || activeTab.showMinified) && (
                <button
                  onClick={() => updateTab(activeTabId, { expandedNodes: new Set() })}
                  style={{
                    backgroundColor: theme === 'vs-high-contrast' ? currentTheme.button : currentTheme.border,
                    color: currentTheme.buttonForeground || currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  全部折叠
                </button>
              )}
              {activeTab.viewMode === 'tree' && (activeTab.showOutput || activeTab.showMinified) && (
                <button
                  onClick={() => {
                    const allPaths = new Set<string>();
                    const collectPaths = (data: any, path: string = '') => {
                      if (Array.isArray(data)) {
                        allPaths.add(path);
                        data.forEach((item, index) => {
                          if (typeof item === 'object' && item !== null) {
                            collectPaths(item, `${path}[${index}]`);
                          }
                        });
                      } else if (typeof data === 'object' && data !== null) {
                        allPaths.add(path);
                        Object.entries(data).forEach(([key, value]) => {
                          if (typeof value === 'object' && value !== null) {
                            collectPaths(value, `${path}.${key}`);
                          }
                        });
                      }
                    };
                    try {
                      const parsed = JSON.parse(activeTab.showOutput ? activeTab.output : activeTab.minified);
                      collectPaths(parsed, 'root');
                      updateTab(activeTabId, { expandedNodes: allPaths });
                    } catch (e) {}
                  }}
                  style={{
                    backgroundColor: theme === 'vs-high-contrast' ? currentTheme.button : currentTheme.border,
                    color: currentTheme.buttonForeground || currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  全部展开
                </button>
              )}
              <button
                onClick={formatJson}
                disabled={processing || !activeTab.content.trim()}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: processing || !activeTab.content.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                格式化
              </button>
              <button
                onClick={minifyJson}
                disabled={processing || !activeTab.content.trim()}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: processing || !activeTab.content.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                压缩
              </button>
              <button
                onClick={() => copyToClipboard(activeTab.showOutput ? activeTab.output : activeTab.minified)}
                disabled={!activeTab.showOutput && !activeTab.showMinified}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: (!activeTab.showOutput && !activeTab.showMinified) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                复制
              </button>
              <button
                onClick={() => downloadFile(activeTab.showOutput ? activeTab.output : activeTab.minified, activeTab.showOutput ? `${activeTab.name.replace('.json', '-formatted.json')}` : `${activeTab.name.replace('.json', '-minified.json')}`)}
                disabled={!activeTab.showOutput && !activeTab.showMinified}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: (!activeTab.showOutput && !activeTab.showMinified) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                下载
              </button>
              <button
                onClick={shareJson}
                disabled={shareLoading || !activeTab.content.trim()}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: (shareLoading || !activeTab.content.trim()) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                {shareLoading ? '生成中...' : '分享'}
              </button>
            </div>
          </div>
          {(activeTab.showOutput || activeTab.showMinified) ? (
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
              whiteSpace: 'pre',
              textAlign: 'left',
              alignItems: 'flex-start',
              justifyContent: 'flex-start'
            }}>
              {(() => {
                try {
                  const jsonText = activeTab.showOutput ? activeTab.output : activeTab.minified;
                  if (!jsonText || jsonText.trim() === '') {
                    return <span style={{ color: currentTheme.placeholder }}>请先输入JSON数据并点击格式化</span>;
                  }
                  
                  if (activeTab.viewMode === 'text') {
                    // 文本模式：直接显示格式化后的JSON字符串
                    return (
                      <pre style={{
                        margin: 0,
                        fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                        fontSize: '14px',
                        lineHeight: '1.5',
                        color: currentTheme.foreground,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        {jsonText}
                      </pre>
                    );
                  } else {
                    // 树形模式：显示可折叠的树形结构
                    const data = JSON.parse(jsonText);
                    return renderJsonTree(data, 'root', 0, activeTab.expandedNodes, (path: string) => {
                      const newExpandedNodes = new Set(activeTab.expandedNodes);
                      if (newExpandedNodes.has(path)) {
                        newExpandedNodes.delete(path);
                      } else {
                        newExpandedNodes.add(path);
                      }
                      updateTab(activeTabId, { expandedNodes: newExpandedNodes });
                    });
                  }
                } catch (e) {
                  return <span style={{ color: '#da3633' }}>JSON格式错误</span>;
                }
              })()}
            </div>
          ) : (
            <div style={{
              flex: 1,
              padding: '16px',
              backgroundColor: '#1e1e1e',
              color: '#8b949e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <div>格式化或压缩结果将显示在这里</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 分享弹窗 */}
      {showShareModal && shareUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
        <div style={{
          backgroundColor: currentTheme.background,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '8px',
          padding: '24px',
          minWidth: '400px',
          maxWidth: '500px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          textAlign: 'left',
        }}>
          {/* 弹窗标题 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: currentTheme.foreground,
            }}>
              <Share2 size={20} />
              分享 JSON 数据
            </div>
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: currentTheme.placeholder,
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = currentTheme.foreground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = currentTheme.placeholder;
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* 分享链接 */}
            <div style={{
              marginBottom: '20px',
            }}>
              <div style={{
                fontSize: '14px',
                color: currentTheme.foreground,
                marginBottom: '8px',
                textAlign: 'left',
              }}>
                分享链接：
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
              }}>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  style={{
                    flex: 1,
                    backgroundColor: currentTheme.header,
                    color: currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                    textAlign: 'left',
                  }}
                />
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  style={{
                    backgroundColor: copySuccess ? '#238636' : currentTheme.button,
                    color: currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    minWidth: '80px',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!copySuccess) {
                      e.currentTarget.style.filter = 'brightness(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!copySuccess) {
                      e.currentTarget.style.filter = 'brightness(1)';
                    }
                  }}
                >
                  {copySuccess ? (
                    <>
                      <span style={{ fontSize: '16px' }}>✓</span>
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      复制
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 说明文字 */}
            <div style={{
              fontSize: '12px',
              color: currentTheme.placeholder,
              lineHeight: '1.4',
              textAlign: 'left',
            }}>
              • 链接有效期为 24 小时<br />
              • 任何人都可以通过此链接访问当前 JSON 数据<br />
              • 请注意分享链接的安全性
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JsonFormatter;