module.exports = {
  apps: [{
    name: 'web-toolkit',
    script: './dist/index.js',
    cwd: './',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      REDIS_HOST: 'redis',
      REDIS_PORT: 6379,
      REDIS_PASSWORD: '',
      REDIS_DB: 0
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      REDIS_HOST: 'redis',
      REDIS_PORT: 6379,
      REDIS_PASSWORD: '',
      REDIS_DB: 0
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3001,
      REDIS_HOST: 'redis',
      REDIS_PORT: 6379,
      REDIS_PASSWORD: '',
      REDIS_DB: 0
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    restart_delay: 4000,
    kill_timeout: 5000,
    listen_timeout: 3000,
    autorestart: true,
    min_uptime: '10s'
  }]
};