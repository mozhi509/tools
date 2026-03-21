import { createClient, type RedisClientType } from 'redis';

/**
 * 延迟创建客户端：须在加载完根目录 .env 后再读取 REDIS_PASSWORD。
 * index.ts 第一行应 import './loadEnv'。
 */
const getRedisConfig = () => {
  let host = process.env.REDIS_HOST || '127.0.0.1';

  if (host === 'localhost') {
    host = '127.0.0.1';
  }

  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD?.trim();
  const db = parseInt(process.env.REDIS_DB || '0', 10);

  const config: {
    socket: { host: string; port: number; connectTimeout: number; lazyConnect: boolean; family: number };
    database: number;
    password?: string;
  } = {
    socket: {
      host,
      port,
      connectTimeout: 10000,
      lazyConnect: true,
      family: 4,
    },
    database: db,
  };

  if (password) {
    config.password = password;
  }

  return config;
};

let _client: RedisClientType | null = null;

function getOrCreateClient(): RedisClientType {
  if (!_client) {
    _client = createClient(getRedisConfig());
    _client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    _client.on('connect', () => {
      console.log('Connected to Redis');
    });
    _client.on('ready', () => {
      console.log('Redis client ready');
    });
    _client.on('end', () => {
      console.log('Redis client disconnected');
    });
  }
  return _client;
}

/** 与真实 redis 客户端行为一致，首次访问时再创建（此时已加载 .env） */
export const redisClient = new Proxy({} as RedisClientType, {
  get(_target, prop, receiver) {
    const c = getOrCreateClient();
    const value = Reflect.get(c, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(c);
    }
    return value;
  },
});

export const connectRedis = async () => {
  try {
    const c = getOrCreateClient();
    if (!c.isOpen) {
      console.log('Connecting to Redis...');
      await c.connect();
      console.log('Redis connected successfully');
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (/NOAUTH|Authentication required/i.test(msg)) {
      console.error(
        'Redis NOAUTH：请确认根目录 .env / .env.prod 中 REDIS_PASSWORD 与 redis requirepass 一致，并已 npm install dotenv。'
      );
    }
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const disconnectRedis = async () => {
  try {
    const c = getOrCreateClient();
    if (c.isOpen) {
      await c.disconnect();
      console.log('Redis disconnected successfully');
    }
  } catch (error) {
    console.error('Error disconnecting from Redis:', error);
  }
};

export const testRedisConnection = async (): Promise<boolean> => {
  try {
    await connectRedis();
    await getOrCreateClient().ping();
    console.log('Redis ping test successful');
    return true;
  } catch (error) {
    console.error('Redis ping test failed:', error);
    return false;
  }
};
