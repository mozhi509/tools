import { Router, Request, Response } from 'express';
import {
  JsonRequest,
  Base64Request,
  Base64DecodeRequest,
  UrlRequest,
  JsonFormatResponse,
  JsonValidateResponse,
  JsonMinifyResponse,
  Base64EncodeResponse,
  Base64DecodeResponse,
  UrlEncodeResponse,
  UrlDecodeResponse
} from '../types/express';

const router = Router();

// JSON格式化工具
router.post('/json/format', (req: Request<{}, JsonFormatResponse, JsonRequest>, res: Response<JsonFormatResponse>) => {
  try {
    const { json, indent = 2 } = req.body;
    
    if (!json) {
      return res.status(400).json({ 
        success: false,
        error: '请提供要格式化的JSON字符串' 
      });
    }

    const parsed = JSON.parse(json);
    const formatted = JSON.stringify(parsed, null, indent);
    
    res.json({
      success: true,
      formatted: formatted,
      original: json
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false,
      error: 'JSON格式错误',
      details: error.message 
    });
  }
});

// JSON验证工具
router.post('/json/validate', (req: Request<{}, JsonValidateResponse, JsonRequest>, res: Response<JsonValidateResponse>) => {
  try {
    const { json } = req.body;
    
    if (!json) {
      return res.status(400).json({ 
        success: false,
        error: '请提供要验证的JSON字符串' 
      });
    }

    JSON.parse(json);
    
    res.json({
      success: true,
      valid: true,
      message: 'JSON格式正确'
    });
  } catch (error: any) {
    res.json({
      success: true,
      valid: false,
      error: error.message
    });
  }
});

// JSON压缩工具
router.post('/json/minify', (req: Request<{}, JsonMinifyResponse, JsonRequest>, res: Response<JsonMinifyResponse>) => {
  try {
    const { json } = req.body;
    
    if (!json) {
      return res.status(400).json({ 
        success: false,
        error: '请提供要压缩的JSON字符串' 
      });
    }

    const parsed = JSON.parse(json);
    const minified = JSON.stringify(parsed);
    
    res.json({
      success: true,
      minified: minified,
      original: json
    });
  } catch (error: any) {
    console.log('Error:', error.message);
    res.status(400).json({ 
      success: false,
      error: 'JSON格式错误',
      details: error.message 
    });
  }
});

// Base64编码工具
router.post('/base64/encode', (req: Request<{}, Base64EncodeResponse, Base64Request>, res: Response<Base64EncodeResponse>) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false,
        error: '请提供要编码的文本' 
      });
    }

    const encoded = Buffer.from(text, 'utf8').toString('base64');
    
    res.json({
      success: true,
      encoded: encoded,
      original: text
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: '编码失败' 
    });
  }
});

// Base64解码工具
router.post('/base64/decode', (req: Request<{}, Base64DecodeResponse, Base64DecodeRequest>, res: Response<Base64DecodeResponse>) => {
  try {
    const { encoded } = req.body;
    
    if (!encoded) {
      return res.status(400).json({ 
        success: false,
        error: '请提供要解码的Base64字符串' 
      });
    }

    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    
    res.json({
      success: true,
      decoded: decoded,
      original: encoded
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: 'Base64格式错误或解码失败' 
    });
  }
});

// URL编码工具
router.post('/url/encode', (req: Request<{}, UrlEncodeResponse, UrlRequest>, res: Response<UrlEncodeResponse>) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: '请提供要编码的URL' 
      });
    }

    const encoded = encodeURIComponent(url);
    
    res.json({
      success: true,
      encoded: encoded,
      original: url
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'URL编码失败' 
    });
  }
});

// URL解码工具
router.post('/url/decode', (req: Request<{}, UrlDecodeResponse, UrlRequest>, res: Response<UrlDecodeResponse>) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: '请提供要解码的URL' 
      });
    }

    const decoded = decodeURIComponent(url);
    
    res.json({
      success: true,
      decoded: decoded,
      original: url
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: 'URL格式错误或解码失败' 
    });
  }
});

export default router;