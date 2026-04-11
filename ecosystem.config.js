module.exports = {
  apps: [{
    name: 'calcmate',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '300M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      SITE_URL: 'https://calculatormate.com.au'
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/home/calcmate/logs/error.log',
    out_file: '/home/calcmate/logs/out.log',
    merge_logs: true
  }]
};
