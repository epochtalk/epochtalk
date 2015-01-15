var server = require('epoch-server');
server.path(__dirname + '/public');
// start server
server.start(function () {
  // server.log('debug', 'config: ' + JSON.stringify(config, undefined, 2));
  server.log('info', 'Epochtalk Frontend server started @' + server.info.uri);
});
