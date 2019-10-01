var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
var routes = require(path.normalize(__dirname + '/routes'));
var hooks = require(path.normalize(__dirname + '/hooks'));
var authorization = require(path.normalize(__dirname + '/authorization'));
var permissions = require(path.normalize(__dirname + '/permissions'));

module.exports =  {
  name: 'mentions',
  authorization: authorization,
  permissions: permissions,
  hooks: hooks,
  // routes: routes,
  db: db
};
