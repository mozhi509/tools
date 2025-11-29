import { createClient } from 'redis';

// 构建Redis连接配置
const getRedisConfig = () => {
  const host = process.env.REDIS_HOST || '127.0.0.1'; // 明确使用 IPv4 地址
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD;
  const db = parseInt(process.env.REDIS_DB || '0', 10);

  const config: any = {
    socket: {
      host,
      port,
      connectTimeout: 10000, // 10秒连接超时
      lazyConnect: true, // 延迟连接
    },
    database: db,
  };

  // 如果有密码，添加认证
  if (password) {
    config.password = password;
  }

  return config;
};

const redisClient = createClient(getRedisConfig());

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

redisClient.on('end', () => {
  console.log('Redis client disconnected');
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      console.log('Connecting to Redis...');
      await redisClient.connect();
      console.log('Redis connected successfully');
    }
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.disconnect();
      console.log('Redis disconnected successfully');
    }
  } catch (error) {
    console.error('Error disconnecting from Redis:', error);
  }
};

// 测试连接的辅助函数
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    await connectRedis();
    await redisClient.ping();
    console.log('Redis ping test successful');
    return true;
  } catch (error) {
    console.error('Redis ping test failed:', error);
    return false;
  }
};

export { redisClient };