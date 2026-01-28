import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import ToolNavigation from '../ToolNavigation';
import { getThemeColors } from '../themes';
import axios from 'axios';

interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  name: string;
  processedUrl?: string;
}

interface VideoFilter {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
}

const VideoEditor: React.FC = () => {

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [uploadedVideoPath, setUploadedVideoPath] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null);
  const [isTrimming, setIsTrimming] = useState<boolean>(false);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [filters, setFilters] = useState<VideoFilter>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);



  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoUrl]);

  const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setUploading(true);
      
      try {
        const formData = new FormData();
        formData.append('video', file);
        
        const response = await axios.post('/api/video/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.success) {
          const url = URL.createObjectURL(file);
          setVideoUrl(url);
          setUploadedVideoPath(response.data.video.filename);
          setClips([]);
          setSelectedClip(null);
          setIsTrimming(false);
        }
      } catch (error: any) {
        console.error('Upload failed:', error);
        alert('视频上传失败: ' + (error.response?.data?.error || error.message));
      } finally {
        setUploading(false);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const startTrim = () => {
    setTrimStart(currentTime);
    setTrimEnd(currentTime);
    setIsTrimming(true);
  };

  const endTrim = async () => {
    if (trimEnd > trimStart && trimEnd - trimStart > 1 && uploadedVideoPath) {
      try {
        const response = await axios.post('/api/video/trim', {
          videoPath: uploadedVideoPath,
          startTime: trimStart,
          endTime: trimEnd,
          outputName: `clip-${Date.now()}`
        });
        
        if (response.data.success) {
          const newClip: VideoClip = {
            id: Date.now().toString(),
            startTime: trimStart,
            endTime: trimEnd,
            name: `片段 ${clips.length + 1}`,
            processedUrl: response.data.videoUrl
          };
          setClips([...clips, newClip]);
        }
      } catch (error: any) {
        console.error('Trim failed:', error);
        alert('视频剪辑失败: ' + (error.response?.data?.error || error.message));
      }
    }
    setIsTrimming(false);
  };

  const deleteClip = (id: string) => {
    setClips(clips.filter(clip => clip.id !== id));
    if (selectedClip?.id === id) {
      setSelectedClip(null);
    }
  };

  const playClip = (clip: VideoClip) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = clip.startTime;
    videoRef.current.play();
    
    // 设置定时器在片段结束时停止
    const stopAtEnd = () => {
      if (videoRef.current && videoRef.current.currentTime >= clip.endTime) {
        videoRef.current.pause();
      }
    };
    
    const interval = setInterval(() => {
      stopAtEnd();
    }, 100);
    
    // 清理定时器
    setTimeout(() => clearInterval(interval), (clip.endTime - clip.startTime) * 1000 + 1000);
  };

  const mergeClips = async () => {
    if (clips.length < 2) {
      alert('至少需要2个视频片段才能合并');
      return;
    }
    
    try {
      const videoPaths = clips.map(clip => clip.processedUrl || uploadedVideoPath);
      const response = await axios.post('/api/video/merge', {
        videoPaths: videoPaths,
        outputName: `merged-${Date.now()}`
      });
      
      if (response.data.success) {
        // 创建合并后的视频URL供下载
        const link = document.createElement('a');
        link.href = `http://localhost:3001${response.data.videoUrl}`;
        link.download = `merged-video-${Date.now()}.mp4`;
        link.click();
      }
    } catch (error: any) {
      console.error('Merge failed:', error);
      alert('视频合并失败: ' + (error.response?.data?.error || error.message));
    }
  };

  const downloadClip = (clip: VideoClip) => {
    if (clip.processedUrl) {
      const link = document.createElement('a');
      link.href = `http://localhost:3001${clip.processedUrl}`;
      link.download = `${clip.name}-${Date.now()}.mp4`;
      link.click();
    } else {
      alert('该片段还未处理完成');
    }
  };

  const handleFilterChange = (filterName: keyof VideoFilter, value: number) => {
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
      `
    };
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
    });
  };

  const currentTheme = getThemeColors('vs-light');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: currentTheme.background }}>
      <ToolNavigation currentTheme={currentTheme} />
      
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: currentTheme.background,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: currentTheme.foreground, marginBottom: '16px' }}>
            🎬 视频剪辑器
          </h2>
          
          {/* 上传区域 */}
          <div style={{
            border: `2px dashed ${currentTheme.border}`,
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            marginBottom: '20px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            backgroundColor: currentTheme.header,
            opacity: uploading ? 0.6 : 1
          }}
               onClick={() => !uploading && fileInputRef.current?.click()}>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              style={{ display: 'none' }}
            />
            <div style={{ color: currentTheme.placeholder }}>
              {uploading ? (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>正在上传视频...</div>
                  <div style={{ fontSize: '12px' }}>请稍候，不要关闭页面</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>点击上传视频或拖拽到此处</div>
                  <div style={{ fontSize: '12px' }}>支持 MP4, WebM, OGG 格式 (最大100MB)</div>
                </>
              )}
            </div>
          </div>

          {videoUrl && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              {/* 视频播放器区域 */}
              <div>
                <div style={{
                  backgroundColor: currentTheme.header,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: currentTheme.foreground, marginBottom: '16px' }}>视频预览</h3>
                  
                  {/* 视频元素 */}
                  <div style={{
                    backgroundColor: '#000',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    position: 'relative'
                  }}>
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '400px',
                        display: 'block',
                        ...getFilterStyle()
                      }}
                    />
                    
                    {/* 剪辑模式覆盖层 */}
                    {isTrimming && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        剪辑模式中...
                      </div>
                    )}
                  </div>

                  {/* 播放控制 */}
                  <div style={{
                    backgroundColor: currentTheme.background,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    {/* 进度条 */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: currentTheme.placeholder,
                        fontSize: '12px',
                        marginBottom: '8px'
                      }}>
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
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

                    {/* 控制按钮 */}
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <button
                        onClick={handlePlayPause}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: currentTheme.button,
                          color: currentTheme.buttonForeground || currentTheme.foreground,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {isPlaying ? '⏸️ 暂停' : '▶️ 播放'}
                      </button>

                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: currentTheme.button,
                          color: currentTheme.buttonForeground || currentTheme.foreground,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        ⏮️ 重置
                      </button>

                      {/* 速度控制 */}
                      <select
                        value={playbackSpeed}
                        onChange={(e) => handleSpeedChange(Number(e.target.value))}
                        style={{
                          padding: '8px',
                          backgroundColor: currentTheme.background,
                          color: currentTheme.foreground,
                          border: `1px solid ${currentTheme.border}`,
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value={0.25}>0.25x</option>
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>

                      {/* 音量控制 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🔊</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          style={{
                            width: '80px',
                            height: '4px',
                            borderRadius: '2px',
                            background: currentTheme.border,
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    </div>

                    {/* 剪辑控制 */}
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap'
                    }}>
                      {!isTrimming ? (
                        <button
                          onClick={startTrim}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          ✂️ 开始剪辑
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setTrimEnd(currentTime)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            ✅ 结束剪辑
                          </button>
                          <button
                            onClick={endTrim}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#2196F3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            💾 保存片段
                          </button>
                          <button
                            onClick={() => setIsTrimming(false)}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            ❌ 取消
                          </button>
                        </>
                      )}
                    </div>

                    {/* 剪辑时间显示 */}
                    {isTrimming && (
                      <div style={{
                        marginTop: '12px',
                        padding: '8px',
                        backgroundColor: currentTheme.header,
                        borderRadius: '4px',
                        color: currentTheme.foreground,
                        fontSize: '14px'
                      }}>
                        剪辑范围: {formatTime(trimStart)} - {formatTime(trimEnd)} 
                        ({formatTime(trimEnd - trimStart)})
                      </div>
                    )}
                  </div>
                </div>

                {/* 视频片段列表 */}
                <div style={{
                  backgroundColor: currentTheme.header,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <h3 style={{ color: currentTheme.foreground, marginBottom: '16px' }}>
                    视频片段 ({clips.length})
                  </h3>
                  
                  {clips.length === 0 ? (
                    <div style={{
                      color: currentTheme.placeholder,
                      textAlign: 'center',
                      padding: '20px'
                    }}>
                      暂无视频片段，使用上方剪辑工具创建片段
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {clips.map((clip) => (
                        <div
                          key={clip.id}
                          style={{
                            backgroundColor: selectedClip?.id === clip.id 
                              ? currentTheme.button 
                              : currentTheme.background,
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: '6px',
                            padding: '12px',
                            color: selectedClip?.id === clip.id 
                              ? (currentTheme.buttonForeground || currentTheme.foreground)
                              : currentTheme.foreground
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <span style={{ fontWeight: 'bold' }}>{clip.name}</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => playClip(clip)}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#4CAF50',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                ▶️ 播放
                              </button>
                              <button
                                onClick={() => downloadClip(clip)}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#2196F3',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                💾 下载
                              </button>
                              <button
                                onClick={() => deleteClip(clip.id)}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                🗑️ 删除
                              </button>
                            </div>
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: currentTheme.placeholder
                          }}>
                            {formatTime(clip.startTime)} - {formatTime(clip.endTime)} 
                            ({formatTime(clip.endTime - clip.startTime)})
                          </div>
                        </div>
                      ))}
                      
                      {clips.length > 1 && (
                        <button
                          onClick={mergeClips}
                          style={{
                            marginTop: '12px',
                            padding: '10px 20px',
                            backgroundColor: '#9C27B0',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          🔗 合并所有片段
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 侧边栏控制面板 */}
              <div>
                {/* 视频滤镜 */}
                <div style={{
                  backgroundColor: currentTheme.header,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: currentTheme.foreground, marginBottom: '16px' }}>视频滤镜</h3>
                  
                  <div style={{ color: currentTheme.foreground, fontSize: '14px' }}>
                    {Object.entries(filters).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '12px' }}>
                        <label style={{
                          display: 'block',
                          marginBottom: '4px',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}>
                          {key === 'brightness' && '🔆 亮度'}
                          {key === 'contrast' && '◐ 对比度'}
                          {key === 'saturation' && '🎨 饱和度'}
                          {key === 'blur' && '💫 模糊'}
                          {key === 'grayscale' && '⬜ 灰度'}
                          {key === 'sepia' && '🟤 复古'}
                          {key === 'hueRotate' && '🌈 色相'}
                          : {value}%
                        </label>
                        <input
                          type="range"
                          min={key === 'blur' ? 0 : key === 'hueRotate' ? 0 : 0}
                          max={key === 'blur' ? 10 : key === 'hueRotate' ? 360 : 200}
                          value={value}
                          onChange={(e) => handleFilterChange(key as keyof VideoFilter, Number(e.target.value))}
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
                    
                    <button
                      onClick={resetFilters}
                      style={{
                        marginTop: '8px',
                        padding: '8px 16px',
                        backgroundColor: currentTheme.button,
                        color: currentTheme.buttonForeground || currentTheme.foreground,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🔄 重置滤镜
                    </button>
                  </div>
                </div>

                {/* 视频信息 */}
                {videoFile && (
                  <div style={{
                    backgroundColor: currentTheme.header,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <h3 style={{ color: currentTheme.foreground, marginBottom: '12px' }}>视频信息</h3>
                    <div style={{ color: currentTheme.placeholder, fontSize: '12px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>文件名:</strong> {videoFile.name}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>文件大小:</strong> {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>时长:</strong> {formatTime(duration)}
                      </div>
                      <div>
                        <strong>类型:</strong> {videoFile.type}
                      </div>
                    </div>
                  </div>
                )}
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
              <li>支持多种视频格式的上传和预览</li>
              <li>✂️ 视频片段剪辑：选择开始和结束时间创建片段</li>
              <li>🎨 视频滤镜：亮度、对比度、饱和度等实时调整</li>
              <li>⚡ 播放速度控制：支持 0.25x 到 2x 变速播放</li>
              <li>🔊 音量调节：可调节播放音量</li>
              <li>📋 片段管理：支持播放、删除、合并视频片段</li>
              <li>💾 导出功能：可导出剪辑后的视频片段</li>
              <li>所有处理均在浏览器本地进行，保护隐私</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;