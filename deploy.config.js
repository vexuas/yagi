module.exports = {
  apps: [
    {
      name: 'yagi',
      script: './dist/yagi.js',
      watch: false,
      env: {
        BOT_ENV: 'dev',
      },
      env_prod: {
        BOT_ENV: 'prod',
      },
    },
  ],
};
