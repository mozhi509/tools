import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, X, Share2 } from 'lucide-react';
import { copyWithFeedback } from '../../utils/clipboard';
import { API_ENDPOINTS } from '../../config/api';
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

const TABS_STORAGE_KEY = 'json-formatter-tabs-v1';

const defaultTabs = (): JsonTab[] => [
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
    expandedNodes: new Set(),
  },
];

function loadPersistedTabs(): { tabs: JsonTab[]; activeTabId: string } | null {
  try {
    const raw = localStorage.getItem(TABS_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as {
      tabs?: Array<Omit<JsonTab, 'expandedNodes'> & { expandedNodes?: string[] }>;
      activeTabId?: string;
    };
    if (!data.tabs?.length) return null;
    const tabs: JsonTab[] = data.tabs.map((t) => ({
      ...t,
      expandedNodes: new Set(Array.isArray(t.expandedNodes) ? t.expandedNodes : []),
    }));
    const activeTabId =
      data.activeTabId && tabs.some((t) => t.id === data.activeTabId)
        ? data.activeTabId
        : tabs[0].id;
    return { tabs, activeTabId };
  } catch {
    return null;
  }
}

const JsonFormatter: React.FC = () => {
  const { shareId } = useParams<{ shareId?: string }>();
  const persisted = typeof window !== 'undefined' ? loadPersistedTabs() : null;
  const [tabs, setTabs] = useState<JsonTab[]>(() => persisted?.tabs ?? defaultTabs());
  const [activeTabId, setActiveTabId] = useState<string>(() => persisted?.activeTabId ?? '1');
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

  // 左侧输入与各标签状态落盘，刷新后仍保留
  useEffect(() => {
    try {
      const payload = {
        tabs: tabs.map((t) => ({
          ...t,
          expandedNodes: Array.from(t.expandedNodes),
        })),
        activeTabId,
      };
      localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore quota / private mode */
    }
  }, [tabs, activeTabId]);

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

  // Format with specific content（返回时若左侧已编辑过，与本次请求 snapshot 不一致则不再覆盖右侧，避免异步抢写）
  const formatJsonWithContent = async (content?: string) => {
    const jsonToFormat = content || activeTab.content;
    if (!jsonToFormat.trim()) return;

    const tabIdForRequest = activeTabId;
    const snapshot = jsonToFormat;

    setProcessing(true);
    try {
      const response = await fetch(API_ENDPOINTS.json.format, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          json: jsonToFormat,
          indent: indentSize,
        }),
      });

      const data = await response.json();

      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== tabIdForRequest) return tab;
          if (tab.content !== snapshot) return tab;

          if (data.success && data.formatted) {
            return {
              ...tab,
              output: data.formatted,
              showOutput: true,
              isValid: true,
              validationError: '',
              expandedNodes: new Set(['root']),
              lastModified: Date.now(),
            };
          }
          return {
            ...tab,
            output: data.error || '格式化失败',
            isValid: false,
            validationError: data.error || '',
            lastModified: Date.now(),
          };
        })
      );
    } catch (_error) {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== tabIdForRequest) return tab;
          if (tab.content !== snapshot) return tab;
          return {
            ...tab,
            output: '网络连接错误',
            isValid: false,
            validationError: '网络连接错误',
            lastModified: Date.now(),
          };
        })
      );
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
      const response = await fetch(API_ENDPOINTS.json.validate, {
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
    const contentToShare = activeTab.showOutput && activeTab.output ? activeTab.output : activeTab.content;
    if (!contentToShare.trim()) {
      window.alert('请先输入要分享的内容');
      return;
    }

    setShareLoading(true);
    try {
      const shareData = {
        data: contentToShare,
        output: activeTab.output,
        showOutput: activeTab.showOutput,
        isValid: activeTab.isValid,
        validationError: activeTab.validationError,
      };

      let response: Response;
      try {
        response = await fetch(API_ENDPOINTS.share.create, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(shareData),
        });
      } catch (netErr) {
        console.error('分享请求失败:', netErr);
        const isFailedFetch =
          netErr instanceof TypeError && /fetch|network|load failed/i.test(netErr.message);
        window.alert(
          isFailedFetch
            ? '分享失败：无法连接后端（Failed to fetch）。请确认：1）已启动 API（默认端口 3001，如 npm run server:dev）；2）开发环境用 npm start 打开站点以便代理 /api；3）勿用本地 file:// 打开页面；4）前后端分离时构建前设置 REACT_APP_API_BASE_URL。'
            : `分享失败：${netErr instanceof Error ? netErr.message : String(netErr)}`
        );
        return;
      }

      const text = await response.text();
      let result: {
        success?: boolean;
        shareUrl?: string;
        shareId?: string;
        error?: string;
        details?: string;
      };
      try {
        result = text ? (JSON.parse(text) as typeof result) : {};
      } catch {
        window.alert(
          `分享失败：接口返回的不是 JSON（HTTP ${response.status}）。常见原因：静态页未由 Node/Nginx 转发 /api，或请求打到了错误主机。`
        );
        return;
      }

      if (response.ok && result.success && (result.shareUrl || result.shareId)) {
        const url =
          result.shareUrl && /^https?:\/\//i.test(result.shareUrl)
            ? result.shareUrl
            : `${window.location.origin}/share/${String(result.shareId)}`;
        setShareUrl(url);
        setShowShareModal(true);
      } else {
        const msg =
          result.error || result.details || `分享失败（HTTP ${response.status}）`;
        window.alert(`${msg}\n\n若与 Redis 相关，请确认本机 Redis 已启动且 .env 中 REDIS_PASSWORD 与实例一致。`);
      }
    } catch (error) {
      console.error('分享失败:', error);
      window.alert(
        `分享失败：${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setShareLoading(false);
    }
  };

  /** 有内容即可分享（不因「校验未通过」隐藏按钮；JSON 不合法也可分享原始文本） */
  const canShareContent = (): boolean => {
    const contentToShare = activeTab.showOutput && activeTab.output ? activeTab.output : activeTab.content;
    return contentToShare.trim().length > 0;
  };

  const loadSharedJson = async (shareId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.share.get(shareId));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅响应路由 shareId / 查询参数，避免 loadSharedJson 引用变化导致重复拉取
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
            <button
              type="button"
              title={canShareContent() ? '生成分享链接（需 Redis）' : '请先输入内容'}
              onClick={shareJson}
              disabled={shareLoading || !canShareContent()}
              style={{
                backgroundColor: currentTheme.button,
                color: currentTheme.foreground,
                border: `1px solid ${currentTheme.border}`,
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: shareLoading || !canShareContent() ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                opacity: canShareContent() ? 1 : 0.55,
              }}
            >
              {shareLoading ? '生成中...' : '分享'}
            </button>
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* 左输入 / 右结果，工具栏按钮逻辑不变 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          minHeight: 0,
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
            <div style={{ marginBottom: '6px', fontSize: '12px', color: currentTheme.placeholder, textAlign: 'left' }}>
              输入 JSON
            </div>
            <textarea
              value={activeTab.content}
              onChange={(e) => {
                const newContent = e.target.value;
                updateTab(activeTabId, {
                  content: newContent,
                  showOutput: false,
                  isValid: null,
                  validationError: '',
                  expandedNodes: new Set(),
                });
                debouncedFormatJson(newContent, 500);
              }}
              onPaste={(e) => {
                const textarea = e.currentTarget as HTMLTextAreaElement;
                setTimeout(() => {
                  if (!textarea?.isConnected) return;
                  const newContent = textarea.value;
                  updateTab(activeTabId, {
                    content: newContent,
                    showOutput: false,
                    isValid: null,
                    validationError: '',
                    expandedNodes: new Set(),
                  });
                  debouncedFormatJson(newContent, 500);
                }, 100);
              }}
              placeholder="在此输入 JSON 数据，自动格式化..."
              style={{
                flex: 1,
                minHeight: 0,
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
                caretColor: currentTheme.button,
              }}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
            <div style={{ marginBottom: '6px', fontSize: '12px', color: currentTheme.placeholder, textAlign: 'left' }}>
              格式化结果
            </div>
            {activeTab.showOutput && activeTab.output && activeTab.viewMode === 'tree' ? (
              <div style={{
                flex: 1,
                minHeight: 0,
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
                readOnly
                value={activeTab.showOutput && activeTab.output ? activeTab.output : ''}
                placeholder="左侧输入后，结果将显示在此；可切换「树形视图」查看折叠结构"
                style={{
                  flex: 1,
                  minHeight: 0,
                  padding: '12px',
                  backgroundColor: currentTheme.header,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '6px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              />
            )}
          </div>
        </div>

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
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '14px' }}>⚠️</span>
            {activeTab.validationError}
          </div>
        )}
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