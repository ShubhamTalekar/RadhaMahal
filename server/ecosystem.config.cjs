module.exports = {
  apps: [
    {
      name: 'radha-mahal-backend',
      script: './index.js',
      instances: process.env.WEB_CONCURRENCY || 1, // Respect container CPU limits (Render sets this)
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
