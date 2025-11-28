import express from 'express';
import { redisClient, connectRedis } from '../redis';

const router = express.Router();

// 存储分享数据，生成短链接
router.post('/create', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: '缺少数据' });
    }

    // 生成唯一ID（不使用 UUID）
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const shareId = (timestamp + random).substring(0, 8); // 使用前8位作为短链接
    
    // 存储到 Redis，设置24小时过期
    await connectRedis();
    await redisClient.setEx(`share:${shareId}`, 24 * 60 * 60, JSON.stringify({
      data,
      createdAt: new Date().toISOString(),
      type: 'json-formatter'
    }));

    // 使用路径参数格式
    const shareUrl = `http://localhost:3000/share/${shareId}`;
    res.json({
      success: true,
      shareId,
      shareUrl: shareUrl
    });
  } catch (error: any) {
    console.error('创建分享失败:', error);
    console.error('错误堆栈:', error.stack);
    console.error('请求体:', req.body);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

// 获取分享数据
router.get('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    
    if (!shareId) {
      return res.status(400).json({ error: '缺少分享ID' });
    }

    await connectRedis();
    const shareData = await redisClient.get(`share:${shareId}`);
    
    if (!shareData) {
      return res.status(404).json({ error: '分享链接已过期或不存在' });
    }

    const parsedData = JSON.parse(shareData);
    res.json({
      success: true,
      data: parsedData.data,
      createdAt: parsedData.createdAt,
      type: parsedData.type
    });
  } catch (error: any) {
    console.error('获取分享数据失败:', error);
    res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
});

export default router;