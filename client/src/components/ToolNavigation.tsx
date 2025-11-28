import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { themes, ThemeColors } from './themes';

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
    id: 'text',
    name: '文本处理',
    icon: '📄',
    tools: [
      { id: 'json', name: 'JSON', icon: '{ }', path: '/json-formatter', description: 'JSON格式化工具' },
      { id: 'base64', name: 'Base64', icon: '🔤', path: '/base64', description: 'Base64编解码器' },
      { id: 'markdown', name: 'Markdown', icon: '📝', path: '/markdown', description: 'Markdown编辑器' },
      { id: 'image', name: '图片编辑', icon: '🖼️', path: '/image-editor', description: '在线图片编辑器' },
      { id: 'video', name: '视频剪辑', icon: '🎬', path: '/video-editor', description: '在线视频剪辑器' },
    ]
  },
  {
    id: 'validation',
    name: '验证测试',
    icon: '✅',
    tools: [
      { id: 'regex', name: '正则', icon: '🔍', path: '/regex', description: '正则表达式测试' },
      { id: 'jwt', name: 'JWT', icon: '🔐', path: '/jwt', description: 'JWT Token解析' },
    ]
  },
  {
    id: 'converter',
    name: '转换工具',
    icon: '🔄',
    tools: [
      { id: 'timestamp', name: '时间戳', icon: '🕐', path: '/timestamp', description: '时间戳转换器' },
      { id: 'url', name: 'URL', icon: '🔗', path: '/url', description: 'URL参数解析' },
      { id: 'color', name: '颜色', icon: '🎨', path: '/color', description: '颜色转换器' },
    ]
  },
  {
    id: 'generator',
    name: '生成器',
    icon: '🎲',
    tools: [
      { id: 'uuid', name: 'UUID', icon: '🆔', path: '/uuid', description: 'UUID生成器' },
    ]
  }
];

// 兼容性：保持原有的tools数组
export const tools: Tool[] = toolCategories.flatMap(category => category.tools);

interface ToolNavigationProps {
  theme: string;
  setTheme: (theme: string) => void;
  currentTheme: ThemeColors;
}

interface CategorySectionProps {
  category: ToolCategory;
  currentTheme: ThemeColors;
  location: any;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, currentTheme, location }) => {
  const navigate = useNavigate();

  // 判断是否为激活状态，支持根路径
  const isActive = (toolPath: string) => {
    if (location.pathname === toolPath) {
      return true;
    }
    // 根路径 / 应该高亮 JSON 工具
    if (location.pathname === '/' && toolPath === '/json-formatter') {
      return true;
    }
    return false;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      flexShrink: 0,
    }}>
      {category.tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => navigate(tool.path)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            backgroundColor: isActive(tool.path)
              ? currentTheme.button 
              : 'transparent',
            color: isActive(tool.path)
              ? (currentTheme.buttonForeground || currentTheme.foreground)
              : currentTheme.placeholder,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'all 0.2s ease',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          title={tool.description}
        >
          <span style={{ fontSize: '14px' }}>{tool.icon}</span>
          <span style={{ fontSize: '14px' }}>{tool.name}</span>
        </button>
      ))}
    </div>
  );
};

const ToolNavigation: React.FC<ToolNavigationProps> = ({ theme, setTheme, currentTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{
      backgroundColor: currentTheme.header,
      borderBottom: `1px solid ${currentTheme.border}`,
      padding: '8px 0',
    }}>
      <div style={{
        margin: '0 auto',
        padding: '0 16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginRight: '16px',
            paddingRight: '16px',
            borderRight: `1px solid ${currentTheme.border}`,
          }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: currentTheme.button }}>
              🔧
            </span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 'bold',
              color: currentTheme.foreground 
            }}>
              DevTools
            </span>
          </div>
          
          {/* 工具导航 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            gap: '16px',
          }}>
            {/* 工具导航 */}
            <div style={{
              display: 'flex',
              gap: '2px',
              alignItems: 'center',
              overflowX: 'auto',
              overflowY: 'hidden',
              flex: 1,
              // 隐藏滚动条
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              <style>
                {`
                  .tools-nav::-webkit-scrollbar {
                    display: none;
                  }
                  .tools-nav::-moz-scrollbar {
                    display: none;
                  }
                  .tools-nav::-ms-scrollbar {
                    display: none;
                  }
                `}
              </style>
              <div className="tools-nav" style={{
                display: 'flex',
                gap: '2px',
                alignItems: 'center',
              }}>
                {toolCategories.map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    currentTheme={currentTheme}
                    location={location}
                  />
                ))}
              </div>
            </div>
            
            {/* 主题选择器 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: '11px',
                color: currentTheme.placeholder,
                marginRight: '4px',
              }}>
                主题:
              </span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                style={{
                  backgroundColor: currentTheme.background,
                  color: currentTheme.foreground,
                  border: `1px solid ${currentTheme.border}`,
                  padding: '4px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {Object.entries(themes).map(([key, themeConfig]) => (
                  <option key={key} value={key}>
                    {themeConfig.name}
                  </option>
                ))}
              </select>
              
              {/* 打赏按钮 */}
              <button
                onClick={() => navigate('/donate')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  backgroundColor: location.pathname === '/donate' 
                    ? currentTheme.button 
                    : 'transparent',
                  color: location.pathname === '/donate' 
                    ? (currentTheme.buttonForeground || currentTheme.foreground)
                    : currentTheme.placeholder,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                title="Buy me a coffee"
              >
                <span style={{ fontSize: '14px' }}>☕</span>
                <span>Coffee</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolNavigation;

