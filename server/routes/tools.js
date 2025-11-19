const express = require('express');
const router = express.Router();

// JSON格式化工具
router.post('/json/format', (req, res) => {
  try {
    const { json, indent = 2 } = req.body;
    
    if (!json) {
      return res.status(400).json({ error: '请提供要格式化的JSON字符串' });
    }

    const parsed = JSON.parse(json);
    const formatted = JSON.stringify(parsed, null, indent);
    
    res.json({
      success: true,
      formatted: formatted,
      original: json
    });
  } catch (error) {
    res.status(400).json({ 
      error: 'JSON格式错误',
      details: error.message 
    });
  }
});

// JSON验证工具
router.post('/json/validate', (req, res) => {
  try {
    const { json } = req.body;
    
    if (!json) {
      return res.status(400).json({ error: '请提供要验证的JSON字符串' });
    }

    JSON.parse(json);
    
    res.json({
      success: true,
      valid: true,
      message: 'JSON格式正确'
    });
  } catch (error) {
    res.json({
      success: true,
      valid: false,
      error: error.message
    });
  }
});

// JSON压缩工具
router.post('/json/minify', (req, res) => {
  try {
    const { json } = req.body;
    
    if (!json) {
      return res.status(400).json({ error: '请提供要压缩的JSON字符串' });
    }


    
    const parsed = JSON.parse(json);
    const minified = JSON.stringify(parsed);
    
    res.json({
      success: true,
      minified: minified,
      original: json
    });
  } catch (error) {
    console.log('Error:', error.message);
    res.status(400).json({ 
      error: 'JSON格式错误',
      details: error.message 
    });
  }
});

// Base64编码工具
router.post('/base64/encode', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: '请提供要编码的文本' });
    }

    const encoded = Buffer.from(text, 'utf8').toString('base64');
    
    res.json({
      success: true,
      encoded: encoded,
      original: text
    });
  } catch (error) {
    res.status(500).json({ error: '编码失败' });
  }
});

// Base64解码工具
router.post('/base64/decode', (req, res) => {
  try {
    const { encoded } = req.body;
    
    if (!encoded) {
      return res.status(400).json({ error: '请提供要解码的Base64字符串' });
    }

    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    
    res.json({
      success: true,
      decoded: decoded,
      original: encoded
    });
  } catch (error) {
    res.status(400).json({ error: 'Base64格式错误或解码失败' });
  }
});

// URL编码工具
router.post('/url/encode', (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: '请提供要编码的URL' });
    }

    const encoded = encodeURIComponent(url);
    
    res.json({
      success: true,
      encoded: encoded,
      original: url
    });
  } catch (error) {
    res.status(500).json({ error: 'URL编码失败' });
  }
});

// URL解码工具
router.post('/url/decode', (req, res) => {
  try {
    const { encoded } = req.body;
    
    if (!encoded) {
      return res.status(400).json({ error: '请提供要解码的URL' });
    }

    const decoded = decodeURIComponent(encoded);
    
    res.json({
      success: true,
      decoded: decoded,
      original: encoded
    });
  } catch (error) {
    res.status(400).json({ error: 'URL格式错误或解码失败' });
  }
});

module.exports = router;