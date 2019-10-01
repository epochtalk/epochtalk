var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
var routes = require(path.normalize(__dirname + '/routes'));
var plugins = require(path.normalize(__dirname + '/plugins'));
var authorization = require(path.normalize(__dirname + '/authorization'));
var permissions = require(path.normalize(__dirname + '/permissions'));

module.exports =  {
  permissions: permissions,
  authorization: authorization,
  name: 'notifications',
  // routes: routes,
  db: db,
  plugins: plugins
};
