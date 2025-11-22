module.exports = {
  apps: [{
    name: 'web-toolkit',
    script: '/root/tools/dist/index.js',
    cwd: '/root/tools/',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/root/tools/logs/err.log',
    out_file: '/root/tools/logs/out.log',
    log_file: '/root/tools/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};