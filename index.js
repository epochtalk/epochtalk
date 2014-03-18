var Hapi = require('hapi');
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
var index = function (request, reply) {
  reply.view('index', { greeting: 'tng index' });
}

server.route({
  method: 'GET',
  path: '/',
  handler: index
});

server.start();
