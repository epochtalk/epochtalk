var config = {
  publicUrl: process.env.PUBLIC_URL,
  host: process.env.HOST,
  port: process.env.PORT,
  websocket_host: process.env.WEBSOCKET_HOST,
  websocket_port: process.env.WEBSOCKET_PORT,
  websocketAPIKey: process.env.WEBSOCKET_API_KEY,
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    options: {
      auth_pass:  process.env.REDIS_AUTH_PASS || null
    }
  }
};

module.exports = config;
