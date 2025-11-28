import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
// import helmet from 'helmet';
import path from 'path';
import toolsRouter from './routes/tools';
import videoRouter from './routes/video';
import shareRouter from './routes/share';
import { connectRedis, disconnectRedis } from './redis';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// API 路由
app.use('/api/tools', toolsRouter);
app.use('/api/video', videoRouter);
app.use('/api/share', shareRouter);

// 健康检查
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 生产环境下所有其他路由返回React应用
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// 错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
const startServer = async () => {
  try {
    // 连接 Redis
    await connectRedis();
    
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('正在关闭服务器...');
  await disconnectRedis();
  process.exit(0);
});

startServer();