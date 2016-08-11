var config = {
  privateKey: process.env.PRIVATE_KEY,
  publicUrl: process.env.PUBLIC_URL,
  host: process.env.HOST,
  port: process.env.PORT,
  websocket_host: process.env.WEBSOCKET_HOST,
  websocket_client_host: process.env.WEBSOCKET_CLIENT_HOST,
  websocket_port: process.env.WEBSOCKET_PORT,
  websocketAPIKey: process.env.WEBSOCKET_API_KEY,
  websocketSecure: process.env.WEBSOCKET_SECURE === 'true',
  emailer_env: {
    sender: process.env.EMAILER_SENDER,
    host: process.env.EMAILER_HOST,
    port: process.env.EMAILER_PORT,
    user: process.env.EMAILER_USER,
    pass: process.env.EMAILER_PASS,
    secure: process.env.EMAILER_SECURE === 'true' || undefined
  },
  images_env: {
    storage: process.env.IMAGES_STORAGE,
    maxSize: process.env.IMAGES_MAX_SIZE,
    expiration: process.env.IMAGES_EXPIRATION,
    interval: process.env.IMAGES_INTERVAL,
    s3: {
      root: process.env.IMAGES_S3_ROOT,
      dir: process.env.IMAGES_S3_DIR,
      bucket: process.env.IMAGES_S3_BUCKET,
      region: process.env.IMAGES_S3_REGION,
      accessKey: process.env.IMAGES_S3_ACCESS_KEY,
      secretKey: process.env.IMAGES_S3_SECRET_KEY
    }
  },
  recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
  recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
  gaKey: process.env.GA_KEY || 'UA-XXXXX-Y',
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    options: {
      auth_pass:  process.env.REDIS_AUTH_PASS || null
    }
  }
};

module.exports = config;
