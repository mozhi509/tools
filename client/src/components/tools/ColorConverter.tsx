import React, { useState, useEffect } from 'react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';

interface ColorFormats {
  hex: string;
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
  hsv: string;
  cmyk: string;
}


const ColorConverter: React.FC = () => {
  const [colorInput, setColorInput] = useState<string>('');
  const [colorFormats, setColorFormats] = useState<ColorFormats | null>(null);
  const [theme, setTheme] = useState<string>('vs-light');

  const sampleColors = [
    { name: '红色', color: '#FF0000' },
    { name: '绿色', color: '#00FF00' },
    { name: '蓝色', color: '#0000FF' },
    { name: '黄色', color: '#FFFF00' },
    { name: '青色', color: '#00FFFF' },
    { name: '品红', color: '#FF00FF' },
    { name: '橙色', color: '#FFA500' },
    { name: '紫色', color: '#800080' },
  ];


  useEffect(() => {
    const savedTheme = localStorage.getItem('json-formatter-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('json-formatter-theme', theme);
  }, [theme]);


  const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number, s: number, l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const rgbToHsv = (r: number, g: number, b: number): { h: number, s: number, v: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;

    const d = max - min;
    if (max !== 0) s = d / max;
    if (max !== min) {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  };

  const rgbToCmyk = (r: number, g: number, b: number): { c: number, m: number, y: number, k: number } => {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);

    if (k === 1) {
      c = m = y = 0;
    } else {
      c = (c - k) / (1 - k);
      m = (m - k) / (1 - k);
      y = (y - k) / (1 - k);
    }

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  const parseColor = (input: string): ColorFormats | null => {
    input = input.trim();
    
    // HEX格式
    const hexMatch = input.match(/^#?([a-f\d]{6})$/i);
    if (hexMatch) {
      const rgb = hexToRgb(hexMatch[1]);
      if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
        return {
          hex: '#' + hexMatch[1].toUpperCase(),
          rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
          hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
          hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
          hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
          cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
        };
      }
    }

    // RGB格式
    const rgbMatch = input.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
        const hex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
        const hsl = rgbToHsl(r, g, b);
        const hsv = rgbToHsv(r, g, b);
        const cmyk = rgbToCmyk(r, g, b);
        return {
          hex: '#' + hex.toUpperCase(),
          rgb: `rgb(${r}, ${g}, ${b})`,
          rgba: `rgba(${r}, ${g}, ${b}, 1)`,
          hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
          hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
          hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
          cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
        };
      }
    }

    // HSL格式
    const hslMatch = input.match(/^hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)$/);
    if (hslMatch) {
      const h = parseInt(hslMatch[1]);
      const s = parseInt(hslMatch[2]);
      const l = parseInt(hslMatch[3]);
      if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
        // 简化的HSL到RGB转换
        const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l / 100 - c / 2;
        let r = 0, g = 0, b = 0;
        
        if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
        else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
        else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
        else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
        else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
        else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        const hex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
        const hsv = rgbToHsv(r, g, b);
        const cmyk = rgbToCmyk(r, g, b);
        return {
          hex: '#' + hex.toUpperCase(),
          rgb: `rgb(${r}, ${g}, ${b})`,
          rgba: `rgba(${r}, ${g}, ${b}, 1)`,
          hsl: `hsl(${h}, ${s}%, ${l}%)`,
          hsla: `hsla(${h}, ${s}%, ${l}%, 1)`,
          hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
          cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
        };
      }
    }

    return null;
  };

  const convertColor = () => {
    if (!colorInput.trim()) {
      setColorFormats(null);
      return;
    }

    const formats = parseColor(colorInput);
    setColorFormats(formats);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setColorInput('');
    setColorFormats(null);
  };

  const handleSampleColor = (color: string) => {
    setColorInput(color);
    const formats = parseColor(color);
    setColorFormats(formats);
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
      <ToolNavigation 
        theme={theme}
        setTheme={setTheme}
        currentTheme={currentTheme}
      />
      
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${currentTheme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: currentTheme.header,
      }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'normal' }}>
          🎨 颜色转换器
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

      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${currentTheme.border}`,
        backgroundColor: currentTheme.header,
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <span style={{ fontSize: '14px', color: currentTheme.foreground }}>示例颜色:</span>
          {sampleColors.map((sample) => (
            <button
              key={sample.name}
              onClick={() => handleSampleColor(sample.color)}
              style={{
                backgroundColor: sample.color,
                color: '#ffffff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title={sample.name}
            >
              {sample.name}
            </button>
          ))}
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
        }}>
          <input
            type="text"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            placeholder="输入颜色 (如: #FF0000, rgb(255,0,0), hsl(0,100%,50%))"
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: currentTheme.background,
              color: currentTheme.foreground,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace',
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                convertColor();
              }
            }}
          />
          <button
            onClick={convertColor}
            disabled={!colorInput.trim()}
            style={{
              backgroundColor: colorInput.trim() ? currentTheme.button : currentTheme.border,
              color: currentTheme.buttonForeground || currentTheme.foreground,
              border: `1px solid ${currentTheme.border}`,
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: colorInput.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
            }}
          >
            转换
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flex: 1,
        padding: '16px',
        gap: '16px',
        overflow: 'hidden',
      }}>
        {colorFormats ? (
          <>
            {/* 颜色预览 */}
            <div style={{
              flex: 1,
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
                  fontSize: '14px',
                  color: currentTheme.foreground,
                }}>
                  颜色预览
                </div>
              </div>
              <div style={{
                height: '150px',
                backgroundColor: colorFormats.hex,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colorFormats.rgb,
                fontSize: '18px',
                fontWeight: 'bold',
              }}>
                {colorFormats.hex}
              </div>
            </div>

            {/* 格式列表 */}
            <div style={{
              flex: 2,
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
                  fontSize: '14px',
                  color: currentTheme.foreground,
                }}>
                  颜色格式
                </div>
              </div>
              <div style={{
                padding: '16px',
                overflow: 'auto',
              }}>
                {Object.entries(colorFormats).map(([format, value]) => (
                  <div
                    key={format}
                    style={{
                      marginBottom: '12px',
                      padding: '8px',
                      backgroundColor: currentTheme.header,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: '4px',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: currentTheme.placeholder, marginBottom: '4px' }}>
                      {format.toUpperCase()}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div style={{ 
                        color: currentTheme.foreground,
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        flex: 1,
                      }}>
                        {value}
                      </div>
                      <button
                        onClick={() => copyToClipboard(value)}
                        style={{
                          backgroundColor: currentTheme.button,
                          color: currentTheme.buttonForeground || currentTheme.foreground,
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          marginLeft: '8px',
                        }}
                      >
                        复制
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
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
            输入颜色进行转换 (支持 HEX, RGB, HSL 格式)
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorConverter;