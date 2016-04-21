var path = require('path');
var config = require(path.join(__dirname, 'config'));
var socketcluster = require('socketcluster-client');
module.exports = socketcluster.connect({
  hostname: config.websocket_host,
  port: config.websocket_port,
  autoReconnect: true,
  autoReconnectOptions: {
    initialDelay: 1000,
    randomness: 1000,
    multiplier: 1.5,
    maxDelay: 10000
  },
  secure: config.websocketSecure,
  rejectUnauthorized: config.websocketRejectUnauthorized
})
.on('error', function(){});
