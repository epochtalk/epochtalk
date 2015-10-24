var path = require('path');
var auth = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'POST', path: '/login', config: auth.login },
  { method: 'DELETE', path: '/logout', config: auth.logout },
  { method: 'POST', path: '/register', config: auth.register },
  { method: 'GET', path: '/register/username/{username}', config: auth.username },
  { method: 'GET', path: '/register/email/{email}', config: auth.email },
  { method: 'GET', path: '/authenticate', config: auth.authenticate },
  { method: 'GET', path: '/recover/{query}', config: auth.recoverAccount },
  { method: 'POST', path: '/reset', config: auth.resetPassword },
  { method: 'POST', path: '/confirm', config: auth.confirmAccount }
];
