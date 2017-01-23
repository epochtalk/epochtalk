var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/users/reports/create')),
  require(path.normalize(__dirname + '/users/reports/update')),
  require(path.normalize(__dirname + '/users/reports/page')),
  require(path.normalize(__dirname + '/users/notes/create')),
  require(path.normalize(__dirname + '/users/notes/update')),
  require(path.normalize(__dirname + '/users/notes/page')),
  require(path.normalize(__dirname + '/posts/reports/create')),
  require(path.normalize(__dirname + '/posts/reports/update')),
  require(path.normalize(__dirname + '/posts/reports/page')),
  require(path.normalize(__dirname + '/posts/notes/create')),
  require(path.normalize(__dirname + '/posts/notes/update')),
  require(path.normalize(__dirname + '/posts/notes/page')),
  require(path.normalize(__dirname + '/messages/reports/create')),
  require(path.normalize(__dirname + '/messages/reports/update')),
  require(path.normalize(__dirname + '/messages/reports/page')),
  require(path.normalize(__dirname + '/messages/notes/create')),
  require(path.normalize(__dirname + '/messages/notes/update')),
  require(path.normalize(__dirname + '/messages/notes/page'))
];
