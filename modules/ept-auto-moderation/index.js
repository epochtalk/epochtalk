var path = require('path');
var authorization = require(path.normalize(__dirname + '/authorization'));
var hooks = require(path.normalize(__dirname + '/hooks'));
var routes = require(path.normalize(__dirname + '/routes'));
var permissions = require(path.normalize(__dirname + '/permissions'));

module.exports =  {
  name: 'autoModeration',
  authorization: authorization,
  permissions: permissions,
  routes: routes,
  hooks: hooks
};
