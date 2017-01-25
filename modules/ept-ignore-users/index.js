var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
var hooks = require(path.normalize(__dirname + '/hooks'));
var routes = require(path.normalize(__dirname + '/routes'));

module.exports =  {
  name: 'ignoreUsers',
  routes: routes,
  hooks: hooks,
  db: db
};
