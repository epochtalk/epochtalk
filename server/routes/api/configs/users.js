var core = require('epochcore')();
var Hapi = require('hapi');
var userSchema = require('../schema/users');

exports.create = {
  handler: function(request, reply) {
    // build the user object from payload and params
    var newUser = {
      username: request.payload.username,
      email: request.payload.email,
      password: request.payload.password,
      confirmation: request.payload.confirmation
    };

    // create the thread in core
    core.users.create(newUser)
    .then(function(user) {
      delete user.passhash;
      reply(user);
    })
    .catch(function(err) { reply(Hapi.error.internal()); });
  },
  validate: { payload: userSchema.validate }
};

exports.update = {
  handler: function(request, reply) {
    // get user from auth service
    var user = request.auth.credentials;

    // build the user object from payload and params
    var updateUser = { id: user.id };
    updateUser.username = request.payload.username;
    updateUser.email = request.payload.email;
    updateUser.password = request.payload.password;
    updateUser.confirmation = request.payload.confirmation;

    // create the thread in core
    core.users.update(updateUser)
    .then(function(user) {
      delete user.passhash;
      user.editable = true;
      reply(user);
    })
    .catch(function(err) { reply(Hapi.error.internal()); });
  },
  validate: { payload: userSchema.validateUpdate },
  auth: { strategy: 'jwt' }
};

exports.find = {
  handler: function(request, reply) {
    // get logged in user
    var authUser = {};
    if (request.auth.isAuthenticated) {
      authUser = request.auth.credentials;
    }
    // get user by username
    var username = request.params.id;
    core.users.userByUsername(username)
    .then(function(user) {
      delete user.passhash;
      if (authUser.id === user.id) { user.editable = true; }
      return user;
    })
    .then(function(user) { reply(user); })
    .catch(function(err) { reply(Hapi.error.internal()); });
  },
  auth: { mode: 'try', strategy: 'jwt' }
};
