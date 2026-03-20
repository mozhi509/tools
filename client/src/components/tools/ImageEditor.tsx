import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';

interface ImageFilter {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
  invert: number;
}

interface BlurArea {
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
}

const ImageEditor: React.FC = () => {

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [filters, setFilters] = useState<ImageFilter>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
    invert: 0,
  });
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  
  // 局部模糊相关状态
  const [blurMode, setBlurMode] = useState<boolean>(false);
  const [blurAreas, setBlurAreas] = useState<BlurArea[]>([]);
  const [isDrawingBlur, setIsDrawingBlur] = useState<boolean>(false);
  const [currentBlurArea, setCurrentBlurArea] = useState<BlurArea | null>(null);
  const [blurIntensity, setBlurIntensity] = useState<number>(10);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);



  useEffect(() => {
    if (originalImage) {
      applyFilters();
    }
    // applyFilters 依赖过多，刻意仅在列出的状态变化时重绘画布
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 见上
  }, [filters, originalImage, rotation, flipH, flipV, blurAreas]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setOriginalImage(result);
        setEditedImage(result);
        resetFilters();
      };
      reader.readAsDataURL(file);
    }
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      hueRotate: 0,
      invert: 0,
    });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBlurAreas([]);
    setCurrentBlurArea(null);
    setIsDrawingBlur(false);
  };

  const applyFilters = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // 设置画布尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 应用变换
      ctx.save();
      
      // 移动到中心点
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // 旋转
      ctx.rotate((rotation * Math.PI) / 180);
      
      // 翻转
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      
      // 应用全局滤镜（不包括模糊）
      ctx.filter = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        grayscale(${filters.grayscale}%)
        sepia(${filters.sepia}%)
        hue-rotate(${filters.hueRotate}deg)
        invert(${filters.invert}%)
      `;
      
      // 绘制基础图像
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // 应用局部模糊
      if (blurAreas.length > 0) {
        blurAreas.forEach(area => {
          ctx.save();
          
          // 将显示坐标转换为图片坐标
          const rect = imageRef.current?.getBoundingClientRect();
          if (!rect) return;
          
          const scaleX = img.width / rect.width;
          const scaleY = img.height / rect.height;
          
          const imgX = area.x * scaleX;
          const imgY = area.y * scaleY;
          const imgWidth = area.width * scaleX;
          const imgHeight = area.height * scaleY;
          
          // 计算变换后的坐标
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          
          // 应用旋转变换
          ctx.translate(centerX, centerY);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
          ctx.translate(-centerX, -centerY);
          
          // 设置圆形裁剪区域
          ctx.beginPath();
          ctx.arc(
            imgX + imgWidth / 2,
            imgY + imgHeight / 2,
            Math.min(imgWidth, imgHeight) / 2,
            0,
            2 * Math.PI
          );
          ctx.clip();
          
          // 应用模糊滤镜
          ctx.filter = `blur(${area.intensity}px)`;
          
          // 在同一位置绘制模糊的图像
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
          
          ctx.restore();
        });
      }

      // 更新编辑后的图像
      setEditedImage(canvas.toDataURL());
    };
    img.src = originalImage;
  };

  const downloadImage = () => {
    if (!editedImage) return;

    const link = document.createElement('a');
    link.download = `edited-image-${Date.now()}.png`;
    link.href = editedImage;
    link.click();
  };

  // 局部模糊相关的处理函数
  const handleBlurMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    console.log('Mouse down triggered', { blurMode, imageRef: !!imageRef.current });
    if (!blurMode || !imageRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log('Starting blur area at', { x, y, intensity: blurIntensity });
    
    setIsDrawingBlur(true);
    setCurrentBlurArea({
      x: x,
      y: y,
      width: 0,
      height: 0,
      intensity: blurIntensity
    });
  };

  const handleBlurMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isDrawingBlur || !currentBlurArea || !imageRef.current) return;
    
    e.preventDefault();
    
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    setCurrentBlurArea({
      ...currentBlurArea,
      width: currentX - currentBlurArea.x,
      height: currentY - currentBlurArea.y
    });
  };

  const handleBlurMouseUp = () => {
    console.log('Mouse up triggered', { isDrawingBlur, currentBlurArea: !!currentBlurArea });
    if (!isDrawingBlur || !currentBlurArea || !imageRef.current) return;
    
    // 简化处理：直接使用当前坐标作为显示坐标
    const normalizedBlurArea = {
      ...currentBlurArea,
      x: currentBlurArea.width < 0 ? currentBlurArea.x + currentBlurArea.width : currentBlurArea.x,
      y: currentBlurArea.height < 0 ? currentBlurArea.y + currentBlurArea.height : currentBlurArea.y,
      width: Math.abs(currentBlurArea.width),
      height: Math.abs(currentBlurArea.height),
      intensity: currentBlurArea.intensity
    };
    
    console.log('Normalized blur area', normalizedBlurArea);
    
    // 只添加有效大小的区域
    if (normalizedBlurArea.width > 20 && normalizedBlurArea.height > 20) {
      setBlurAreas(prev => [...prev, normalizedBlurArea]);
      console.log('Added blur area', { count: blurAreas.length + 1 });
    }
    
    setIsDrawingBlur(false);
    setCurrentBlurArea(null);
  };

  // 添加全局鼠标事件监听
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDrawingBlur) {
        handleBlurMouseUp();
      }
    };

    if (isDrawingBlur) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleBlurMouseUp 为稳定逻辑，避免重复绑定
  }, [isDrawingBlur, currentBlurArea]);

  const clearBlurAreas = () => {
    setBlurAreas([]);
    setCurrentBlurArea(null);
    setIsDrawingBlur(false);
  };

  const deleteLastBlurArea = () => {
    setBlurAreas(prev => prev.slice(0, -1));
  };

  const handleFilterChange = (filterName: keyof ImageFilter, value: number) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const getFilterStyle = (): React.CSSProperties => {
    return {
      filter: `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        blur(${filters.blur}px)
        grayscale(${filters.grayscale}%)
        sepia(${filters.sepia}%)
        hue-rotate(${filters.hueRotate}deg)
        invert(${filters.invert}%)
      `,
      transform: `
        rotate(${rotation}deg)
        scaleX(${flipH ? -1 : 1})
        scaleY(${flipV ? -1 : 1})
      `
    };
  };

  const currentTheme = getThemeColors('vs-light');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: currentTheme.background }}>
      <ToolNavigation currentTheme={currentTheme} />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: currentTheme.background,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: currentTheme.foreground, marginBottom: '16px' }}>
            🖼️ 在线图片编辑器
          </h2>
          
          {/* 上传区域 */}
          <div style={{
            border: `2px dashed ${currentTheme.border}`,
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            marginBottom: '20px',
            cursor: 'pointer',
            backgroundColor: currentTheme.header
          }}
               onClick={() => fileInputRef.current?.click()}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <div style={{ color: currentTheme.placeholder }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>点击上传图片或拖拽到此处</div>
              <div style={{ fontSize: '12px' }}>支持 JPG, PNG, GIF, WebP 格式</div>
            </div>
          </div>

          {originalImage && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
              {/* 图片预览区域 */}
              <div>
                <div style={{
                  backgroundColor: currentTheme.header,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <h3 style={{ color: currentTheme.foreground, marginBottom: '16px' }}>预览</h3>
                  <div 
                    style={{ 
                      position: 'relative', 
                      display: 'inline-block',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      cursor: blurMode ? 'crosshair' : 'default'
                    }}
                  >
                    <img
                      ref={imageRef}
                      src={editedImage || originalImage}
                      alt="编辑预览"
                      onMouseDown={handleBlurMouseDown}
                      onMouseMove={handleBlurMouseMove}
                      onMouseUp={handleBlurMouseUp}
                      onMouseLeave={handleBlurMouseUp}
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '4px',
                        ...getFilterStyle(),
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                      }}
                    />
                    
                    {/* 显示模糊区域 */}
                    {blurAreas.map((area, index) => {
                      const normalizedX = area.width < 0 ? area.x + area.width : area.x;
                      const normalizedY = area.height < 0 ? area.y + area.height : area.y;
                      const normalizedWidth = Math.abs(area.width);
                      const normalizedHeight = Math.abs(area.height);
                      
                      return (
                        <div
                          key={index}
                          style={{
                            position: 'absolute',
                            left: normalizedX,
                            top: normalizedY,
                            width: normalizedWidth,
                            height: normalizedHeight,
                            border: '2px dashed #ff4444',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                            backgroundColor: 'rgba(255, 68, 68, 0.1)'
                          }}
                        />
                      );
                    })}
                    
                    {/* 当前正在绘制的区域 */}
                    {currentBlurArea && (() => {
                      const normalizedX = currentBlurArea.width < 0 ? currentBlurArea.x + currentBlurArea.width : currentBlurArea.x;
                      const normalizedY = currentBlurArea.height < 0 ? currentBlurArea.y + currentBlurArea.height : currentBlurArea.y;
                      const normalizedWidth = Math.abs(currentBlurArea.width);
                      const normalizedHeight = Math.abs(currentBlurArea.height);
                      
                      return (
                        <div
                          style={{
                            position: 'absolute',
                            left: normalizedX,
                            top: normalizedY,
                            width: normalizedWidth,
                            height: normalizedHeight,
                            border: '2px dashed #4444ff',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                            backgroundColor: 'rgba(68, 68, 255, 0.1)'
                          }}
                        />
                      );
                    })()}
                  </div>
                  <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* 操作按钮 */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '16px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={resetFilters}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: currentTheme.button,
                      color: currentTheme.buttonForeground || currentTheme.foreground,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 重置
                  </button>
                  <button
                    onClick={() => setRotation(prev => prev - 90)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: currentTheme.button,
                      color: currentTheme.buttonForeground || currentTheme.foreground,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ↺ 左旋转
                  </button>
                  <button
                    onClick={() => setRotation(prev => prev + 90)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: currentTheme.button,
                      color: currentTheme.buttonForeground || currentTheme.foreground,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ↻ 右旋转
                  </button>
                  <button
                    onClick={() => setFlipH(prev => !prev)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: currentTheme.button,
                      color: currentTheme.buttonForeground || currentTheme.foreground,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ↔️ 水平翻转
                  </button>
                  <button
                    onClick={() => setFlipV(prev => !prev)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: currentTheme.button,
                      color: currentTheme.buttonForeground || currentTheme.foreground,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ↕️ 垂直翻转
                  </button>
                  <button
                    onClick={downloadImage}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    💾 下载图片
                  </button>
                </div>
                
                {/* 局部模糊控制按钮 */}
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: currentTheme.header,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '8px'
                }}>
                  <h4 style={{ color: currentTheme.foreground, marginBottom: '12px', fontSize: '14px' }}>
                    🔲 局部模糊
                  </h4>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => setBlurMode(!blurMode)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: blurMode ? '#ff4444' : currentTheme.button,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {blurMode ? '🛑 停止绘制' : '✏️ 开始绘制'}
                    </button>
                    <button
                      onClick={deleteLastBlurArea}
                      disabled={blurAreas.length === 0}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: blurAreas.length > 0 ? '#ff9800' : currentTheme.border,
                        color: blurAreas.length > 0 ? 'white' : currentTheme.placeholder,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: blurAreas.length > 0 ? 'pointer' : 'not-allowed',
                        fontSize: '12px'
                      }}
                    >
                      ↩️ 撤销上一个
                    </button>
                    <button
                      onClick={clearBlurAreas}
                      disabled={blurAreas.length === 0}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: blurAreas.length > 0 ? '#f44336' : currentTheme.border,
                        color: blurAreas.length > 0 ? 'white' : currentTheme.placeholder,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: blurAreas.length > 0 ? 'pointer' : 'not-allowed',
                        fontSize: '12px'
                      }}
                    >
                      🗑️ 清除全部
                    </button>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{
                      display: 'block',
                      color: currentTheme.foreground,
                      fontSize: '12px',
                      marginBottom: '4px'
                    }}>
                      模糊强度: {blurIntensity}px
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={blurIntensity}
                      onChange={(e) => setBlurIntensity(Number(e.target.value))}
                      style={{
                        width: '100%',
                        height: '4px',
                        borderRadius: '2px',
                        background: currentTheme.border,
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  {blurAreas.length > 0 && (
                    <div style={{
                      color: currentTheme.placeholder,
                      fontSize: '11px'
                    }}>
                      已添加 {blurAreas.length} 个模糊区域
                    </div>
                  )}
                </div>
              </div>

              {/* 滤镜控制面板 */}
              <div>
                <div style={{
                  backgroundColor: currentTheme.header,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h3 style={{ color: currentTheme.foreground, marginBottom: '16px' }}>调整参数</h3>
                  
                  <div style={{ color: currentTheme.foreground, fontSize: '14px' }}>
                    {Object.entries(filters).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '16px' }}>
                        <label style={{
                          display: 'block',
                          marginBottom: '4px',
                          fontWeight: 'bold'
                        }}>
                          {key === 'brightness' && '🔆 亮度'}
                          {key === 'contrast' && '◐ 对比度'}
                          {key === 'saturation' && '🎨 饱和度'}
                          {key === 'blur' && '💫 模糊'}
                          {key === 'grayscale' && '⬜ 灰度'}
                          {key === 'sepia' && '🟤 复古'}
                          {key === 'hueRotate' && '🌈 色相'}
                          {key === 'invert' && '🔄 反色'}
                          : {value}%
                        </label>
                        <input
                          type="range"
                          min={key === 'blur' ? 0 : key === 'hueRotate' ? 0 : 0}
                          max={key === 'blur' ? 10 : key === 'hueRotate' ? 360 : 200}
                          value={value}
                          onChange={(e) => handleFilterChange(key as keyof ImageFilter, Number(e.target.value))}
                          style={{
                            width: '100%',
                            height: '4px',
                            borderRadius: '2px',
                            background: currentTheme.border,
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 功能说明 */}
          <div style={{
            backgroundColor: currentTheme.header,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '8px',
            padding: '16px',
            marginTop: '20px'
          }}>
            <h3 style={{ color: currentTheme.foreground, marginBottom: '12px' }}>功能说明</h3>
            <ul style={{ color: currentTheme.placeholder, fontSize: '14px', paddingLeft: '20px' }}>
              <li>支持多种图片格式的上传和编辑</li>
              <li>实时预览滤镜效果</li>
              <li>支持亮度、对比度、饱和度等参数调整</li>
              <li>支持图片旋转和翻转</li>
              <li>🔲 <strong>局部模糊功能</strong>：点击"开始绘制"后在图片上拖拽选择需要模糊的区域</li>
              <li>支持调整局部模糊的强度（1-50像素）</li>
              <li>可添加多个模糊区域，支持撤销和清除操作</li>
              <li>编辑完成后可下载到本地</li>
              <li>所有处理均在浏览器本地进行，保护隐私</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;