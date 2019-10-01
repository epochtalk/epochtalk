var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
var routes = require(path.normalize(__dirname + '/routes'));
var authorization = require(path.normalize(__dirname + '/authorization'));
var permissions = require(path.normalize(__dirname + '/permissions'));
var plugins = require(path.normalize(__dirname + '/plugins'));

module.exports =  {
  name: 'blacklist',
  authorization: authorization,
  permissions: permissions,
  // routes: routes,
  db: db,
  plugins: plugins
};
