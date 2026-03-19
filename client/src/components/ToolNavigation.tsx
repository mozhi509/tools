import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeColors } from './themes';
import { API_ENDPOINTS } from '../config/api';

export interface Tool {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  icon: string;
  tools: Tool[];
}

export const toolCategories: ToolCategory[] = [
  {
    id: 'toolbox',
    name: '工具箱',
    icon: '🧰',
    tools: [
      { id: 'json', name: 'JSON', icon: '{ }', path: '/json-formatter', description: 'JSON格式化工具' },
      { id: 'base64', name: 'Base64', icon: '🔤', path: '/base64', description: 'Base64编解码器' },
      { id: 'markdown', name: 'Markdown', icon: '📝', path: '/markdown', description: 'Markdown编辑器' },
      { id: 'image', name: '图片编辑', icon: '🖼️', path: '/image-editor', description: '在线图片编辑器' },
      { id: 'video', name: '视频剪辑', icon: '🎬', path: '/video-editor', description: '在线视频剪辑器' },
      { id: 'regex', name: '正则', icon: '🔍', path: '/regex', description: '正则表达式测试' },
      { id: 'jwt', name: 'JWT', icon: '🔐', path: '/jwt', description: 'JWT Token解析' },
      { id: 'timestamp', name: '时间戳', icon: '🕐', path: '/timestamp', description: '时间戳转换器' },
      { id: 'url', name: 'URL', icon: '🔗', path: '/url', description: 'URL参数解析' },
      { id: 'color', name: '颜色', icon: '🎨', path: '/color', description: '颜色转换器' },
      { id: 'uuid', name: 'UUID', icon: '🆔', path: '/uuid', description: 'UUID生成器' },
      { id: 'hash', name: '哈希', icon: '#', path: '/hash', description: '哈希计算器' },
      { id: 'encrypt', name: '加密', icon: '🔒', path: '/encrypt', description: '加密解密工具' },
    ]
  }
];

export const tools: Tool[] = toolCategories.flatMap(category => category.tools);

interface ToolNavigationProps {
  currentTheme: ThemeColors;
}

const ToolNavigation: React.FC<ToolNavigationProps> = ({ currentTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isToolboxOpen, setIsToolboxOpen] = React.useState(false);
  const [creatingChat, setCreatingChat] = React.useState(false);

  const handleToolClick = (toolPath: string) => {
    navigate(toolPath);
    setIsToolboxOpen(false);
  };

  const currentTool = tools.find(tool => location.pathname.includes(tool.path));

  const handleCreateChat = async () => {
    if (creatingChat) return;
    setCreatingChat(true);
    try {
      const response = await fetch(API_ENDPOINTS.chat.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || '创建聊天失败');
      }

      const chatPath = data.chatPath as string;
      const chatUrl = `${window.location.origin}${chatPath}`;
      window.open(chatUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建聊天失败';
      window.alert(message);
    } finally {
      setCreatingChat(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      backgroundColor: currentTheme.background,
      borderBottom: `1px solid ${currentTheme.border}`,
      minHeight: '48px',
      flexWrap: 'wrap',
      gap: '8px',
    }}>
      {/* 左侧：工具箱和当前工具 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flex: 1,
        minWidth: '200px',
      }}>
        {/* 工具箱下拉菜单 */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsToolboxOpen(!isToolboxOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              color: currentTheme.foreground,
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.hover || currentTheme.background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.background;
            }}
          >
            <span>🧰</span>
            <span>工具箱</span>
            <span style={{ 
              fontSize: '10px',
              transition: 'transform 0.2s ease',
              transform: isToolboxOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
            {currentTool && (
              <span style={{
                marginLeft: '8px',
                color: currentTheme.accent || currentTheme.button,
                fontSize: '12px'
              }}>
                {currentTool.icon} {currentTool.name}
              </span>
            )}
          </button>

          {/* 下拉菜单 */}
          {isToolboxOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: '200px',
              maxHeight: '400px',
              overflowY: 'auto',
            }}>
              {toolCategories.map((category) => (
                <div key={category.id}>
                  <div style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: currentTheme.accent || currentTheme.button,
                    borderBottom: `1px solid ${currentTheme.border}`,
                  }}>
                    {category.icon} {category.name}
                  </div>
                  {category.tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: currentTheme.background,
                        border: 'none',
                        color: currentTheme.foreground,
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = currentTheme.hover || currentTheme.background;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = currentTheme.background;
                      }}
                    >
                      <span>{tool.icon}</span>
                      <span>{tool.name}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>



      <div>
        <button
          onClick={() => { void handleCreateChat(); }}
          disabled={creatingChat}
          style={{
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '13px',
            backgroundColor: creatingChat ? '#d1d5db' : '#2563eb',
            color: '#fff',
            cursor: creatingChat ? 'not-allowed' : 'pointer',
          }}
        >
          {creatingChat ? '创建中...' : '发起聊天'}
        </button>
      </div>

      {/* 点击外部关闭下拉菜单 */}
      {isToolboxOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setIsToolboxOpen(false)}
        />
      )}
    </div>
  );
};

export default ToolNavigation;