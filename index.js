var Hapi = require('hapi');
var routes = require('./routes');
var config = require('./config');

var options = {
  views: {
    path: __dirname + '/templates',
    engines: {
      haml: 'hamljs'
    },
    compileOptions: {
      pretty: true
    }
  }
};

var server = new Hapi.Server(config.port, options);
server.route(routes);
server.start();
