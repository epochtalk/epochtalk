var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
var routes = require(path.normalize(__dirname + '/routes'));
var permissions = require(path.normalize(__dirname + '/permissions'));
var authorization = require(path.normalize(__dirname + '/authorization'));

module.exports =  {
  name: 'moderators',
  permissions: permissions,
  db: db,
  routes: routes,
  authorization: authorization
};
