module.exports = {
  apps: [{
    name: 'web-toolkit',
    script: './dist/index.js',
    cwd: './',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 3001,
      REDIS_HOST: '127.0.0.1',
      REDIS_PORT: 6379,
      REDIS_PASSWORD: 'W0g5u3T8eXq4VZn0EjrviDaWFG7bp916a8Gy/8C2+rE=',
      REDIS_DB: 0
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      REDIS_HOST: 'redis',
      REDIS_PORT: 6379,
      REDIS_PASSWORD: 'W0g5u3T8eXq4VZn0EjrviDaWFG7bp916a8Gy/8C2+rE=',
      REDIS_DB: 0,
      MAX_MEMORY_RESTART: '1G',
      NODE_MAX_OLD_SPACE_SIZE: 1024,
      DOMAIN: process.env.DOMAIN || 'yourdomain.com',
      HTTPS_ENABLED: process.env.HTTPS_ENABLED || 'false'
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3001,
      REDIS_HOST: 'redis',
      REDIS_PORT: 6379,
      REDIS_PASSWORD: 'W0g5u3T8eXq4VZn0EjrviDaWFG7bp916a8Gy/8C2+rE=',
      REDIS_DB: 0,
      MAX_MEMORY_RESTART: '1G',
      NODE_MAX_OLD_SPACE_SIZE: 1024
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: process.env.MAX_MEMORY_RESTART || '1G',
    node_args: `--max-old-space-size=${process.env.NODE_MAX_OLD_SPACE_SIZE || 1024}`,
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads', 'dist'],
    restart_delay: 4000,
    kill_timeout: 5000,
    listen_timeout: 3000,
    autorestart: true,
    min_uptime: '10s',
    max_restarts: 10,
    merge_logs: true,
    source_map_support: true
  }]
};