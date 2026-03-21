import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import toolsRouter from './routes/tools';
import videoRouter from './routes/video';
import shareRouter from './routes/share';
import chatRouter from './routes/chat';
import { connectRedis, disconnectRedis } from './redis';

/** 生产环境允许的浏览器 Origin（未设 CORS_ORIGINS 时含主域与 www） */
function getProductionCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (raw && raw.trim()) {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return ['https://zhimingli.com', 'https://www.zhimingli.com'];
}

const app = express();
const PORT = process.env.PORT || 3001;

// 勿使用 trust proxy: true —— express-rate-limit 会报 ERR_ERL_PERMISSIVE_TRUST_PROXY。
// 前面有几层反代（通常 Nginx=1），用数字；本地直连 Node 用 false。
const trustProxyHops =
  process.env.NODE_ENV === 'production'
    ? Number(process.env.TRUST_PROXY_HOPS ?? 1)
    : 0;
app.set('trust proxy', trustProxyHops <= 0 ? false : trustProxyHops);

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// 中间件
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? getProductionCorsOrigins()
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务（生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// API 路由
app.use('/api/tools', toolsRouter);
app.use('/api/video', videoRouter);
app.use('/api/share', shareRouter);
app.use('/api/chat', chatRouter);

// 健康检查
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 生产环境下所有其他路由返回React应用
if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// 错误处理中间件
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err instanceof Error ? err.stack : err);
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