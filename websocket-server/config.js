var os = require('os');
var fs = require('fs');
var path = require('path');
var keyPath = process.env.WEBSOCKET_SERVER_KEY_NAME || path.join(__dirname, 'server.key');
var certPath = process.env.WEBSOCKET_SERVER_CERT_NAME || path.join(__dirname, 'server.crt');

// check that key and cert exist when necessary
if (process.env.WEBSOCKET_SERVER_PROTOCOL === 'https') {
  try {
    fs.accessSync(keyPath);
    fs.accessSync(certPath);
  }
  catch(e) {
    console.log(e.message);
    console.log('Provide a key/cert, or unset WEBSOCKET_SERVER_PROTOCOL');
    console.log('WEBSOCKET_SERVER_PROTOCOL', process.env.WEBSOCKET_SERVER_PROTOCOL);
    console.log('WEBSOCKET_SERVER_KEY_NAME', process.env.WEBSOCKET_SERVER_KEY_NAME || '(server.key)');
    console.log('WEBSOCKET_SERVER_CERT_NAME', process.env.WEBSOCKET_SERVER_CERT_NAME || '(server.crt)');
    process.exit(e.errno);
  }
}

module.exports = {
  authKey: process.env.WEBSOCKET_SERVER_PRIVATE_KEY,
  workers: os.cpus().length,
  brokers: os.cpus().length,
  port: process.env.WEBSOCKET_SERVER_PORT,
  host: process.env.WEBSOCKET_SERVER_BIND_ADDRESS,
  wsEngine: process.env.WEBSOCKET_SERVER_ENGINE || 'ws',
  protocol: process.env.WEBSOCKET_SERVER_PROTOCOL,
  protocolOptions: {
    key: fs.readFileSync(keyPath, 'utf8'),
    cert: fs.readFileSync(certPath, 'utf8'),
    passphrase: process.env.WEBSOCKET_SERVER_PASS
  },
  redis: {
    host: process.env.WEBSOCKET_SERVER_REDIS_HOST,
    port: process.env.WEBSOCKET_SERVER_REDIS_PORT,
    db: process.env.WEBSOCKET_SERVER_REDIS_DB,
    options: {
      password: process.env.WEBSOCKET_SERVER_REDIS_OPTIONS_PASSWORD || null
    }
  },
  redisChannels: {
    onlineUsersChannel: 'online-users'
  },
  APIKey: process.env.WEBSOCKET_SERVER_API_KEY
};
