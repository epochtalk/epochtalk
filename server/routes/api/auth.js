var path = require('path');
var auth = require(path.join(__dirname, 'configs', 'auth'));

module.exports = [
  { method: 'POST', path: '/login', config: auth.login },
  { method: 'POST', path: '/logout', config: auth.logout },
  { method: 'POST', path: '/register', config: auth.register }
  // { method: 'POST', path: '/refreshToken', config: auth.refreshToken }
];