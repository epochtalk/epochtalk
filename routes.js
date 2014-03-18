var Types = require('hapi').types;

var index = function (request, reply) {
  reply.view('index', { greeting: 'tng index' });
}

// routes
module.exports = [
  { method: 'GET', path: '/', handler: index }
];

