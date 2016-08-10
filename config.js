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
