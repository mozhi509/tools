module.exports = {
  apps: [{
    name: 'web-toolkit',
    script: 'dist/index.js',
    cwd: '/var/www/web-toolkit',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/www/web-toolkit/logs/err.log',
    out_file: '/var/www/web-toolkit/logs/out.log',
    log_file: '/var/www/web-toolkit/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};