var path = require('path');
var config = require(path.join(__dirname, 'config'));
var socketcluster = require('socketcluster-client');
module.exports = socketcluster.connect({
  hostname: config.websocket_host,
  port: config.websocket_port
});
