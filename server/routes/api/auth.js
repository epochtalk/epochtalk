var path = require('path');
var auth = require(path.join(__dirname, 'configs', 'auth'));

module.exports = [
  { method: 'POST', path: '/login', config: auth.login },
  { method: 'DELETE', path: '/logout', config: auth.logout },
  { method: 'POST', path: '/register', config: auth.register },
  { method: 'GET', path: '/register/username/{username}', config: auth.username },
  { method: 'GET', path: '/register/email/{email}', config: auth.email },
  { method: 'GET', path: '/authenticated', config: auth.isAuthenticated }
  // { method: 'POST', path: '/refreshToken', config: auth.refreshToken }
];
