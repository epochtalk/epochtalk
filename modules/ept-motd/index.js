var path = require('path');
var routes = require(path.normalize(__dirname + '/routes'));
var db = require(path.normalize(__dirname + '/db'));
var authorization = require(path.normalize(__dirname + '/authorization'));
var permissions = require(path.normalize(__dirname + '/permissions'));

module.exports =  {
  name: 'motd',
  authorization: authorization,
  permissions: permissions,
  db: db,
  routes: routes
};
