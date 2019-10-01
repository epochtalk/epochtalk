var path = require('path');
var hooks = require(path.normalize(__dirname + '/hooks'));
var routes = require(path.normalize(__dirname + '/routes'));
var permissions = require(path.normalize(__dirname + '/permissions'));

module.exports =  {
  name: 'autoModeration',
  permissions: permissions,
  routes: routes,
  hooks: hooks
};
