import { createClient, type RedisClientType } from 'redis';

/**
 * 延迟创建客户端：须在加载完根目录 .env 后再读取 REDIS_PASSWORD。
 * index.ts 第一行应 import './loadEnv'。
 */
/** 本地 Redis 无 requirepass 但 .env 写了 REDIS_PASSWORD 时，置为 true 后不再传密码 */
let _omitRedisPassword = false;

function getRedisPasswordForConfig(): string | undefined {
  if (_omitRedisPassword) return undefined;
  const p = process.env.REDIS_PASSWORD?.trim();
  return p || undefined;
}

const getRedisConfig = () => {
  let host = process.env.REDIS_HOST || '127.0.0.1';

  if (host === 'localhost') {
    host = '127.0.0.1';
  }

  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = getRedisPasswordForConfig();
  const db = parseInt(process.env.REDIS_DB || '0', 10);

  const config: {
    socket: {
      host: string;
      port: number;
      connectTimeout: number;
      lazyConnect: boolean;
      family: number;
      keepAlive: boolean;
      reconnectStrategy: (retries: number) => number | Error;
    };
    database: number;
    password?: string;
  } = {
    socket: {
      host,
      port,
      connectTimeout: 10000,
      lazyConnect: true,
      family: 4,
      keepAlive: true,
      reconnectStrategy: (retries: number) => {
        if (retries > 50) {
          return new Error('Redis 重连次数过多，请检查网络与 Redis 服务');
        }
        return Math.min(retries * 100, 3000);
      },
    },
    database: db,
  };

  if (password) {
    config.password = password;
  }

  return config;
};

let _client: RedisClientType | null = null;

async function resetRedisClient(): Promise<void> {
  if (!_client) return;
  try {
    if (_client.isOpen) {
      await _client.disconnect();
    }
  } catch {
    /* ignore */
  }
  _client = null;
}

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

function isRedisAuthNoPasswordConfiguredError(msg: string): boolean {
  return /without any password configured|called without any password/i.test(msg);
}

/** 等待一次连接结果：ready 或首个 error（避免 connect() 在 AUTH 不匹配时长时间挂起） */
async function waitForRedisReadyOrError(client: RedisClientType): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeoutMs = 15000;
    const timeout = setTimeout(() => {
      cleanup();
      reject(
        new Error(
          `Redis 连接超时（${timeoutMs / 1000}s），请检查 REDIS_HOST/REDIS_PORT 与 Redis 是否已启动`
        )
      );
    }, timeoutMs);

    const onReady = () => {
      cleanup();
      resolve();
    };
    const onErr = (err: Error) => {
      cleanup();
      reject(err);
    };
    const cleanup = () => {
      clearTimeout(timeout);
      client.off('ready', onReady);
      client.off('error', onErr);
    };

    if (client.isReady) {
      cleanup();
      resolve();
      return;
    }

    client.once('ready', onReady);
    client.once('error', onErr);
    if (!client.isOpen) {
      client.connect().catch(onErr);
    }
  });
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

export const connectRedis = async (): Promise<void> => {
  try {
    const c = getOrCreateClient();
    if (c.isReady) {
      return;
    }
    if (!process.env.REDIS_PASSWORD?.trim()) {
      console.warn(
        '[redis] REDIS_PASSWORD 未设置：若实例启用了 requirepass，将报 NOAUTH。请在根目录 .env 中设置并与 redis-cli CONFIG GET requirepass 一致，然后重启 Node。'
      );
    }
    console.log('Connecting to Redis...');
    await waitForRedisReadyOrError(c);
    console.log('Redis connected successfully');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (
      isRedisAuthNoPasswordConfiguredError(msg) &&
      !_omitRedisPassword &&
      process.env.REDIS_PASSWORD?.trim()
    ) {
      console.warn(
        '[redis] 检测到 Redis 未配置 requirepass，但 .env 中设置了 REDIS_PASSWORD；已忽略密码并重试连接。'
      );
      await resetRedisClient();
      _omitRedisPassword = true;
      return connectRedis();
    }
    if (/NOAUTH|Authentication required/i.test(msg)) {
      console.error(
        'Redis NOAUTH：密码不匹配或未配置。请 (1) 根目录 .env / .env.prod 中设置 REDIS_PASSWORD（与 requirepass 一致）(2) 重启进程 (3) 服务器执行: ./manage.sh check-redis'
      );
    }
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const disconnectRedis = async () => {
  try {
    if (!_client) return;
    const c = _client;
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
