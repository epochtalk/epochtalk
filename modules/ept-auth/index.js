var path = require('path');
var routes = require(path.normalize(__dirname + '/routes'));
var authorization = require(path.normalize(__dirname + '/authorization'));


module.exports =  {
  name: 'auth',
  routes: routes,
  authorization: authorization
};
