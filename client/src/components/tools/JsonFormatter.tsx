import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, X, Share2 } from 'lucide-react';
import { copyWithFeedback } from '../../utils/clipboard';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';

interface JsonTab {
  id: string;
  name: string;
  content: string;
  output: string;
  isValid: boolean | null;
  validationError: string;
  showOutput: boolean;
  lastModified: number;
  isEditing: boolean;
  viewMode: 'text' | 'tree';
  expandedNodes: Set<string>;
}

const JsonFormatter: React.FC = () => {
  const { shareId } = useParams<{ shareId?: string }>();
  const [tabs, setTabs] = useState<JsonTab[]>([
    {
      id: '1',
      name: 'Untitled-1.json',
      content: '',
      output: '',
      isValid: null,
      validationError: '',
      showOutput: false,
      lastModified: Date.now(),
      isEditing: false,
      viewMode: 'text',
      expandedNodes: new Set()
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [processing, setProcessing] = useState<boolean>(false);
  const [indentSize, setIndentSize] = useState<number>(2);

  const [shareLoading, setShareLoading] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [formatTimeout, setFormatTimeout] = useState<NodeJS.Timeout | null>(null);

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  useEffect(() => {
    const savedIndentSize = localStorage.getItem('json-formatter-indent');
    if (savedIndentSize) {
      setIndentSize(parseInt(savedIndentSize, 10));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('json-formatter-indent', indentSize.toString());
  }, [indentSize]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (formatTimeout) {
        clearTimeout(formatTimeout);
      }
    };
  }, [formatTimeout]);

  const createNewTab = () => {
    const newTab: JsonTab = {
      id: Date.now().toString(),
      name: `Untitled-${tabs.length + 1}.json`,
      content: '',
      output: '',
      isValid: null,
      validationError: '',
      showOutput: false,
      lastModified: Date.now(),
      isEditing: false,
      viewMode: 'text',
      expandedNodes: new Set()
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
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
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.isEditing) {
      return;
    }
    
    if (tabId === activeTabId) {
      return;
    }
    
    setActiveTabId(tabId);
  };

  const handleTabDoubleClick = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      const tab = tabs.find(t => t.id === tabId);
      if (tab) {
        updateTab(tabId, { isEditing: false });
      }
    }
  };

  const formatJson = async () => {
    await formatJsonWithContent();
  };

  // Format with specific content
  const formatJsonWithContent = async (content?: string) => {
    const jsonToFormat = content || activeTab.content;
    if (!jsonToFormat.trim()) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/tools/json/format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          json: jsonToFormat,
          indent: indentSize 
        }),
      });

      const data = await response.json();
      
      if (data.success && data.formatted) {
        updateTab(activeTabId, {
          output: data.formatted,
          showOutput: true,
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

  // Debounced version of formatJson
  const debouncedFormatJson = (content: string, delay: number = 500) => {
    // Clear existing timeout
    if (formatTimeout) {
      clearTimeout(formatTimeout);
    }
    
    // Set new timeout
    if (content.trim()) {
      const timeout = setTimeout(() => {
        formatJsonWithContent(content);
      }, delay);
      setFormatTimeout(timeout);
    } else {
      updateTab(activeTabId, { 
        output: '', 
        showOutput: false,
        validationError: '',
        isValid: null,
        expandedNodes: new Set()
      });
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

  const copyToClipboard = async (text: string): Promise<void> => {
    await copyWithFeedback(
      text,
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      },
      (error) => {
        console.error('复制失败:', error);
        alert(error);
      }
    );
  };

  const shareJson = async () => {
    // Get the actual content that's being displayed
    const contentToShare = activeTab.showOutput && activeTab.output ? activeTab.output : activeTab.content;
    
    setShareLoading(true);
    try {
      // 确保使用实际的内容作为data字段
      const shareData = {
        data: contentToShare, // Use the actual content being shared
        output: activeTab.output,
        showOutput: activeTab.showOutput,
        isValid: activeTab.isValid,
        validationError: activeTab.validationError
      };
      
      console.log('分享数据:', shareData);
      console.log('contentToShare:', contentToShare);
      console.log('activeTab.content:', activeTab.content);
      console.log('activeTab.output:', activeTab.output);
      
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      });

      console.log('分享响应状态:', response.status);
      
      const result = await response.json();
      console.log('分享响应结果:', result);
      
      if (result.success) {
        setShareUrl(result.shareUrl);
        setShowShareModal(true);
      } else {
        console.error('分享失败原因:', result);
      }
    } catch (error) {
      console.error('分享失败:', error);
    } finally {
      setShareLoading(false);
    }
  };

  // Check if share button should be shown
  const shouldShowShareButton = () => {
    const contentToShare = activeTab.showOutput && activeTab.output ? activeTab.output : activeTab.content;
    const hasContent = contentToShare.trim();
    const isValidJson = activeTab.isValid === true || activeTab.isValid === null;
    return hasContent && isValidJson;
  };

  const loadSharedJson = async (shareId: string) => {
    try {
      const response = await fetch(`/api/share/${shareId}`);
      const result = await response.json();
      
      if (result.success) {
        const sharedData = result.data;
        const jsonContent = typeof sharedData === 'string' ? sharedData : (sharedData.content || '');
        
        let formattedOutput = '';
        let isValid = true;
        let validationError = '';
        
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
          isValid: isValid,
          validationError: validationError,
          showOutput: true,
          lastModified: Date.now(),
          isEditing: false,
          viewMode: 'text',
          expandedNodes: new Set(['root'])
        };
        
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
      }
    } catch (error) {
      console.error('加载分享数据失败:', error);
    }
  };

  useEffect(() => {
    if (shareId) {
      loadSharedJson(shareId);
    } else {
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
          {isEmpty && <span style={{ color: currentTheme.bracket }}>]</span>}
          
          {isExpanded && !isEmpty && (
            <div style={{ marginLeft: `${(indent + 1) * indentSize * 4}px`, textAlign: 'left' }}>
              {data.map((item, index) => (
                <div key={index} style={{ textAlign: 'left' }}>
                  {renderJsonTree(item, `${path}[${index}]`, indent + 1, expandedNodes, onToggle)}
                  {index < data.length - 1 && <span style={{ color: currentTheme.comma }}>,</span>}
                </div>
              ))}
              <div style={{ color: currentTheme.bracket, textAlign: 'left' }}>]</div>
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
          {isEmpty && <span style={{ color: currentTheme.bracket }}>{'}'}</span>}
          
          {isExpanded && !isEmpty && (
            <div style={{ marginLeft: `${(indent + 1) * indentSize * 4}px`, textAlign: 'left' }}>
              {entries.map(([key, value], index) => (
                <div key={key} style={{ textAlign: 'left' }}>
                  <span style={{ color: currentTheme.key }}>"{key}"</span>
                  <span style={{ color: currentTheme.comma }}>: </span>
                  {renderJsonTree(value, `${path}.${key}`, indent + 1, expandedNodes, onToggle)}
                  {index < entries.length - 1 && <span style={{ color: currentTheme.comma }}>,</span>}
                </div>
              ))}
              <div style={{ color: currentTheme.bracket, textAlign: 'left' }}>{'}'}</div>
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
    
    const jsonString = JSON.stringify(exampleJson);
    
    updateTab(activeTabId, {
      content: jsonString,
      output: '',
      isValid: null,
      validationError: '',
      showOutput: false,
      expandedNodes: new Set()
    });
    
    // Directly trigger formatJson for immediate result with updated content
    setTimeout(() => {
      // Use the latest content directly
      formatJsonWithContent(jsonString);
    }, 50);
  };

  const clearAll = () => {
    updateTab(activeTabId, {
      content: '',
      output: '',
      isValid: null,
      validationError: '',
      showOutput: false,
      expandedNodes: new Set()
    });
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
        backgroundColor: currentTheme.header,
        borderBottom: `1px solid ${currentTheme.border}`,
      }}>
        <div style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {shareUrl && !showShareModal && (
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
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px 0 16px',
          backgroundColor: currentTheme.header,
          borderTop: `1px solid ${currentTheme.border}`,
          minHeight: '36px',
        }}>
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
                  borderTop: tab.id === activeTabId 
                    ? `1px solid ${currentTheme.border}` 
                    : '1px solid transparent',
                  borderLeft: tab.id === activeTabId 
                    ? `1px solid ${currentTheme.border}` 
                    : '1px solid transparent',
                  borderRight: tab.id === activeTabId 
                    ? `1px solid ${currentTheme.border}` 
                    : '1px solid transparent',
                  borderBottom: tab.id === activeTabId 
                    ? `1px solid ${currentTheme.background}` 
                    : '1px solid transparent',
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

          {/* Control buttons moved here */}
          <div style={{ 
            display: 'flex', 
            gap: '4px', 
            alignItems: 'center',
            paddingLeft: '8px',
            borderLeft: `1px solid ${currentTheme.border}`
          }}>
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
            <button
              onClick={loadExample}
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
              示例
            </button>
            <button
              onClick={validateJson}
              disabled={processing}
              style={{
                backgroundColor: activeTab.isValid === true ? '#238636' : activeTab.isValid === false ? '#da3633' : currentTheme.button,
                color: currentTheme.foreground,
                border: `1px solid ${currentTheme.border}`,
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontSize: '12px',
              }}
            >
              {processing ? '处理中...' : '验证'}
            </button>
            <button
              onClick={() => {
                const newViewMode = activeTab.viewMode === 'tree' ? 'text' : 'tree';
                if (newViewMode === 'tree') {
                  // When switching to tree view, ensure we have formatted output
                  if (!activeTab.output && activeTab.content.trim()) {
                    formatJson().then(() => {
                      updateTab(activeTabId, { viewMode: 'tree', showOutput: true });
                    });
                  } else {
                    updateTab(activeTabId, { viewMode: 'tree', showOutput: true });
                  }
                } else {
                  updateTab(activeTabId, { viewMode: 'text' });
                }
              }}
              style={{
                backgroundColor: currentTheme.border,
                color: currentTheme.foreground,
                border: `1px solid ${currentTheme.border}`,
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {activeTab.viewMode === 'tree' ? '文本视图' : '树形视图'}
            </button>
            {activeTab.viewMode === 'tree' && (
              <>
                <button
                  onClick={() => updateTab(activeTabId, { expandedNodes: new Set() })}
                  style={{
                    backgroundColor: currentTheme.border,
                    color: currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  全部折叠
                </button>
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
                      const parsed = JSON.parse(activeTab.output);
                      collectPaths(parsed, 'root');
                      updateTab(activeTabId, { expandedNodes: allPaths });
                    } catch (e) {}
                  }}
                  style={{
                    backgroundColor: currentTheme.border,
                    color: currentTheme.foreground,
                    border: `1px solid ${currentTheme.border}`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  全部展开
                </button>
              </>
            )}
            <button
              onClick={() => copyToClipboard(activeTab.showOutput && activeTab.output ? activeTab.output : activeTab.content)}
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
              复制
            </button>
            <button
              onClick={() => downloadFile(activeTab.showOutput && activeTab.output ? activeTab.output : activeTab.content, `${activeTab.name.replace('.json', '-formatted.json')}`)}
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
              下载
            </button>
            {shouldShowShareButton() && (
              <button
                onClick={shareJson}
                disabled={shareLoading}
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: shareLoading ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                {shareLoading ? '生成中...' : '分享'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        overflow: 'hidden',
      }}>
        {/* Single input area with auto-format */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {activeTab.showOutput && activeTab.output && activeTab.viewMode === 'tree' ? (
            <div style={{
              flex: 1,
              padding: '12px',
              backgroundColor: currentTheme.header,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              overflow: 'auto',
              textAlign: 'left',
              fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              fontSize: '14px',
              lineHeight: '1.5',
            }}>
              {(() => {
                try {
                  const data = JSON.parse(activeTab.output);
                  return renderJsonTree(data, 'root', 0, activeTab.expandedNodes, (path: string) => {
                    const newExpandedNodes = new Set(activeTab.expandedNodes);
                    if (newExpandedNodes.has(path)) {
                      newExpandedNodes.delete(path);
                    } else {
                      newExpandedNodes.add(path);
                    }
                    updateTab(activeTabId, { expandedNodes: newExpandedNodes });
                  });
                } catch (e) {
                  return (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#da3633',
                      fontSize: '14px',
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                        <div>JSON 格式错误</div>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          ) : (
            <textarea
              value={activeTab.showOutput && activeTab.output ? activeTab.output : activeTab.content}
              onChange={(e) => {
                const newContent = e.target.value;
                updateTab(activeTabId, { 
                  content: newContent,
                  showOutput: false,
                  isValid: null,
                  validationError: '',
                  expandedNodes: new Set()
                });
                
                // Auto-format on input change
                debouncedFormatJson(newContent, 500);
              }}
              onPaste={(e) => {
                // Handle paste events to ensure auto-formatting
                setTimeout(() => {
                  const textarea = e.currentTarget;
                  const newContent = textarea.value;
                  updateTab(activeTabId, { 
                    content: newContent,
                    showOutput: false,
                    isValid: null,
                    validationError: '',
                    expandedNodes: new Set()
                  });
                  
                  debouncedFormatJson(newContent, 500);
                }, 100);
              }}
              onFocus={(e) => {
                // When focus enters, if showing formatted output, switch to input mode
                if (activeTab.showOutput && activeTab.output) {
                  updateTab(activeTabId, { 
                    content: activeTab.output,
                    showOutput: false
                  });
                }
              }}
              placeholder="在此输入 JSON 数据，自动格式化..."
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: currentTheme.background,
                color: currentTheme.foreground,
                border: `1px solid ${activeTab.isValid === false ? '#da3633' : currentTheme.border}`,
                borderRadius: '6px',
                outline: 'none',
                resize: 'none',
                fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                fontSize: '14px',
                lineHeight: '1.5',
                caretColor: currentTheme.button
              }}
            />
          )}
          
          {activeTab.validationError && (
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: '#da3633',
              color: 'white',
              fontSize: '12px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '14px' }}>⚠️</span>
              {activeTab.validationError}
            </div>
          )}
        </div>
      </div>

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