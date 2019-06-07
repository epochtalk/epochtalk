var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
var routes = require(path.normalize(__dirname + '/routes'));
var authorization = require(path.normalize(__dirname + '/authorization'));
var permissions = require(path.normalize(__dirname + '/permissions'));

module.exports =  {
  name: 'configurations',
  authorization: authorization,
  permissions: permissions,
  routes: routes,
  db: db
};
