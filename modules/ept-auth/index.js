var path = require('path');
var routes = require(path.normalize(__dirname + '/routes'));
var authorization = require(path.normalize(__dirname + '/authorization'));
var plugins = require(path.normalize(__dirname + '/plugins'));

module.exports =  {
  name: 'auth',
  routes: routes,
  authorization: authorization,
  plugins: plugins
};
