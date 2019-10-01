var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
var routes = require(path.normalize(__dirname + '/routes'));
var permissions = require(path.normalize(__dirname + '/permissions'));
var authorization = require(path.normalize(__dirname + '/authorization'));
var common = require(path.normalize(__dirname + '/common'));

module.exports =  {
  name: 'portal',
  permissions: permissions,
  db: db,
  // routes: routes,
  common: common.export(),
  authorization: authorization
};
