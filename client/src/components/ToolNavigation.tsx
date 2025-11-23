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

export const tools: Tool[] = [
  { id: 'json', name: 'JSON', icon: '{ }', path: '/json-formatter', description: 'JSON格式化工具' },
  { id: 'base64', name: 'Base64', icon: '🔤', path: '/base64', description: 'Base64编解码器' },
  { id: 'regex', name: '正则', icon: '🔍', path: '/regex', description: '正则表达式测试' },
  { id: 'timestamp', name: '时间戳', icon: '🕐', path: '/timestamp', description: '时间戳转换器' },
  { id: 'url', name: 'URL', icon: '🔗', path: '/url', description: 'URL参数解析' },
  { id: 'markdown', name: 'Markdown', icon: '📝', path: '/markdown', description: 'Markdown编辑器' },
  { id: 'jwt', name: 'JWT', icon: '🔐', path: '/jwt', description: 'JWT Token解析' },
  { id: 'uuid', name: 'UUID', icon: '🆔', path: '/uuid', description: 'UUID生成器' },
  { id: 'color', name: '颜色', icon: '🎨', path: '/color', description: '颜色转换器' },
];

interface ToolNavigationProps {
  theme: string;
  setTheme: (theme: string) => void;
  currentTheme: ThemeColors;
}

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
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: currentTheme.button }}>
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
              gap: '4px',
              alignItems: 'center',
              overflow: 'auto',
              flex: 1,
            }}>
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => navigate(tool.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    backgroundColor: location.pathname === tool.path 
                      ? currentTheme.button 
                      : 'transparent',
                    color: location.pathname === tool.path 
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
                  <span>{tool.name}</span>
                </button>
              ))}
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

