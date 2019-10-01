var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
var init = require(path.normalize(__dirname + '/db/init'));
var hooks = require(path.normalize(__dirname + '/hooks'));
var routes = require(path.normalize(__dirname + '/routes'));
var permissions = require(path.normalize(__dirname + '/permissions'));
var authorization = require(path.normalize(__dirname + '/authorization'));

module.exports =  {
  name: 'userTrust',
  authorization: authorization,
  permissions: permissions,
  // routes: routes,
  hooks: hooks,
  db: db,
  init: init
};
