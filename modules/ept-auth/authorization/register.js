var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function(server, email, username) {
  // check unique email
  var emailCond = server.db.users.userByEmail(email)
  .then(function(user) {
    if (user) { return Promise.reject(Boom.badRequest('Email Already Exists')); }
    else { return true; }
  });

  // check unique username
  var usernameCond = server.db.users.userByUsername(username)
  .then(function(user) {
    if (user) { return Promise.reject(Boom.badRequest('Username Already Exists')); }
    else { return true;}
  });

  return Promise.all([emailCond, usernameCond]);
};
