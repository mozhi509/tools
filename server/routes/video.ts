import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import {
  VideoTrimRequest,
  VideoTrimResponse,
  VideoMergeRequest,
  VideoMergeResponse,
  VideoFilterRequest,
  VideoFilterResponse
} from '../types/video';

const router = Router();

// 配置文件上传
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传视频文件'));
    }
  }
});

// 生成唯一文件名的辅助函数
const generateUniqueFileName = (prefix: string, extension: string = '.mp4'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}${extension}`;
};

// 安全的文件名验证函数
const sanitizeFilename = (filename: string): string => {
  // 移除路径分隔符和特殊字符
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

// 上传视频
router.post('/upload', upload.single('video'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '没有上传文件'
      });
    }

    // 验证文件大小（额外检查）
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (req.file.size > maxSize) {
      // 删除已上传的文件
      fs.unlinkSync(req.file.path);
      return res.status(413).json({
        success: false,
        error: '文件大小超过限制'
      });
    }

    // 安全地处理原始文件名
    const sanitizedName = sanitizeFilename(req.file.originalname);
    
    const videoInfo = {
      filename: req.file.filename,
      originalName: sanitizedName,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    };

    res.json({
      success: true,
      video: videoInfo
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: '文件上传失败'
    });
  }
});

// 视频剪辑
router.post('/trim', async (req: Request<{}, VideoTrimResponse, VideoTrimRequest>, res: Response<VideoTrimResponse>) => {
  try {
    const { videoPath, startTime, endTime, outputName } = req.body;
    
    if (!videoPath || startTime === undefined || endTime === undefined || !outputName) {
      return res.status(400).json({
        success: false,
        error: '参数不完整'
      });
    }

    // 安全的文件路径处理，防止路径遍历攻击
    const sanitizedVideoPath = sanitizeFilename(path.basename(videoPath));
    const inputPath = path.join('uploads', sanitizedVideoPath);
    const outputPath = path.join('uploads/processed', generateUniqueFileName(sanitizeFilename(outputName)));

    // 确保输出目录存在
    if (!fs.existsSync('uploads/processed')) {
      fs.mkdirSync('uploads/processed', { recursive: true });
    }

    // 检查输入文件是否存在
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({
        success: false,
        error: '源视频文件不存在'
      });
    }

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(endTime - startTime)
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    const outputUrl = `/api/video/download/${path.basename(outputPath)}`;

    res.json({
      success: true,
      videoUrl: outputUrl
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 视频合并
router.post('/merge', async (req: Request<{}, VideoMergeResponse, VideoMergeRequest>, res: Response<VideoMergeResponse>) => {
  try {
    const { videoPaths, outputName } = req.body;
    
    if (!videoPaths || videoPaths.length < 2 || !outputName) {
      return res.status(400).json({
        success: false,
        error: '参数不完整或视频数量不足'
      });
    }

    // 安全处理所有视频路径
    const inputPaths = videoPaths.map(videoPath => 
      path.join('uploads', sanitizeFilename(path.basename(videoPath)))
    );

    // 检查所有输入文件是否存在
    for (const inputPath of inputPaths) {
      if (!fs.existsSync(inputPath)) {
        return res.status(404).json({
          success: false,
          error: '源视频文件不存在'
        });
      }
    }

    const outputPath = path.join('uploads/processed', generateUniqueFileName(outputName));
    
    // 确保输出目录存在
    if (!fs.existsSync('uploads/processed')) {
      fs.mkdirSync('uploads/processed', { recursive: true });
    }

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg();
      
      // 添加所有输入文件
      inputPaths.forEach((inputPath: string) => {
        command.input(inputPath);
      });
      
      command
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .mergeToFile(outputPath, 'uploads/temp');
    });

    const outputUrl = `/api/video/download/${path.basename(outputPath)}`;

    res.json({
      success: true,
      videoUrl: outputUrl
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 视频滤镜
router.post('/filter', async (req: Request<{}, VideoFilterResponse, VideoFilterRequest>, res: Response<VideoFilterResponse>) => {
  try {
    const { videoPath, filters, outputName } = req.body;
    
    if (!videoPath || !filters || !outputName) {
      return res.status(400).json({
        success: false,
        error: '参数不完整'
      });
    }

    // 安全的文件路径处理，防止路径遍历攻击
    const sanitizedVideoPath = sanitizeFilename(path.basename(videoPath));
    const inputPath = path.join('uploads', sanitizedVideoPath);
    const outputPath = path.join('uploads/processed', generateUniqueFileName(sanitizeFilename(outputName)));

    // 确保输出目录存在
    if (!fs.existsSync('uploads/processed')) {
      fs.mkdirSync('uploads/processed', { recursive: true });
    }

    // 检查输入文件是否存在
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({
        success: false,
        error: '源视频文件不存在'
      });
    }

    // 构建滤镜字符串
    const filterParts = [] as string[];
    
    if (filters.brightness && filters.brightness !== 100) {
      filterParts.push(`eq=brightness=${filters.brightness/100}`);
    }
    if (filters.contrast && filters.contrast !== 100) {
      filterParts.push(`eq=contrast=${filters.contrast/100}`);
    }
    if (filters.saturation && filters.saturation !== 100) {
      filterParts.push(`eq=saturation=${filters.saturation/100}`);
    }
    if (filters.blur && filters.blur > 0) {
      filterParts.push(`boxblur=${filters.blur}:${filters.blur}`);
    }
    if (filters.grayscale && filters.grayscale > 0) {
      filterParts.push(`hue=s=0`);
    }
    if (filters.sepia && filters.sepia > 0) {
      filterParts.push(`colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`);
    }
    if (filters.hueRotate && filters.hueRotate > 0) {
      filterParts.push(`hue=h=${filters.hueRotate}`);
    }

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputPath);
      
      if (filterParts.length > 0) {
        command.videoFilters(filterParts.join(','));
      }
      
      command
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    const outputUrl = `/api/video/download/${path.basename(outputPath)}`;

    res.json({
      success: true,
      videoUrl: outputUrl
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 下载处理后的视频
router.get('/download/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    
    // 防止路径遍历攻击
    const sanitizedFilename = sanitizeFilename(filename);
    const filePath = path.join('uploads/processed', sanitizedFilename);

    // 验证文件路径是否在允许的目录内
    const resolvedPath = path.resolve(filePath);
    const allowedDir = path.resolve('uploads/processed');
    if (!resolvedPath.startsWith(allowedDir)) {
      return res.status(403).json({
        success: false,
        error: '访问被拒绝'
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: '文件不存在'
      });
    }

    // 设置安全头
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    res.download(filePath, sanitizedFilename, (err) => {
      if (err) {
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: '下载失败'
          });
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: '下载失败'
    });
  }
});

// 获取视频信息
router.get('/info/:filename', async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join('uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: '文件不存在'
      });
    }

    const info = await new Promise<any>((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });

    res.json({
      success: true,
      info: {
        duration: info.format.duration,
        size: info.format.size,
        bitrate: info.format.bit_rate,
        format: info.format.format_name,
        streams: info.streams.map((stream: any) => ({
          codec: stream.codec_name,
          type: stream.codec_type,
          width: stream.width,
          height: stream.height,
          fps: stream.r_frame_rate,
          bitrate: stream.bit_rate
        }))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 删除临时文件
router.delete('/cleanup/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    
    // 尝试删除上传目录和已处理目录中的文件
    const uploadedPath = path.join('uploads', filename);
    const processedPath = path.join('uploads/processed', filename);
    
    let deleted = false;
    
    if (fs.existsSync(uploadedPath)) {
      fs.unlinkSync(uploadedPath);
      deleted = true;
    }
    
    if (fs.existsSync(processedPath)) {
      fs.unlinkSync(processedPath);
      deleted = true;
    }

    res.json({
      success: deleted,
      message: deleted ? '文件删除成功' : '文件不存在'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;