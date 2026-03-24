/**
 * PM2 配置：密钥仅从 process.env 读取，勿在仓库中写死密码。
 *
 * 本地/CI：先加载环境再启动，例如：
 *   set -a && source .env.prod && set +a && pm2 start ecosystem.config.js --env production
 * 或使用 ./manage.sh start-prod
 *
 * 生产：先加载 .env / .env.prod 再 pm2 start，或依赖宿主已 export 的 REDIS_*。
 */

function intEnv(name, fallback) {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

const redisPassword = process.env.REDIS_PASSWORD || '';

module.exports = {
  apps: [{
    name: 'web-toolkit',
    script: './dist/index.js',
    cwd: './',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: intEnv('PORT', 3001),
      REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
      REDIS_PORT: intEnv('REDIS_PORT', 6379),
      REDIS_PASSWORD: redisPassword,
      REDIS_DB: intEnv('REDIS_DB', 0)
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: intEnv('PORT', 3001),
      REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
      REDIS_PORT: intEnv('REDIS_PORT', 6379),
      REDIS_PASSWORD: redisPassword,
      REDIS_DB: intEnv('REDIS_DB', 0),
      MAX_MEMORY_RESTART: process.env.MAX_MEMORY_RESTART || '1G',
      NODE_MAX_OLD_SPACE_SIZE: intEnv('NODE_MAX_OLD_SPACE_SIZE', 1024),
      DOMAIN: process.env.DOMAIN || 'yourdomain.com',
      HTTPS_ENABLED: process.env.HTTPS_ENABLED || 'false'
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: intEnv('PORT', 3001),
      REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
      REDIS_PORT: intEnv('REDIS_PORT', 6379),
      REDIS_PASSWORD: redisPassword,
      REDIS_DB: intEnv('REDIS_DB', 0),
      MAX_MEMORY_RESTART: process.env.MAX_MEMORY_RESTART || '1G',
      NODE_MAX_OLD_SPACE_SIZE: intEnv('NODE_MAX_OLD_SPACE_SIZE', 1024)
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: process.env.MAX_MEMORY_RESTART || '1G',
    node_args: `--max-old-space-size=${intEnv('NODE_MAX_OLD_SPACE_SIZE', 1024)}`,
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads', 'dist'],
    restart_delay: 4000,
    kill_timeout: 5000,
    // 须在 connectRedis 之后再 listen，应大于 Redis 连接耗时（见 server/index.ts）
    listen_timeout: 20000,
    autorestart: true,
    min_uptime: '10s',
    max_restarts: 10,
    merge_logs: true,
    source_map_support: true
  }]
};
