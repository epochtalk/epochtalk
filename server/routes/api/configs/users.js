var core = require('epochcore')();
var Hapi = require('hapi');
var path = require('path');
var userSchema = require('../schema/users');
var pre = require(path.join('..', 'pre', 'users'));

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
  pre: [[
    { method: pre.getCurrentUser, assign: 'currentUser' },
    { method: pre.checkUsernameUniqueness },
    { method: pre.checkEmailUniqueness }
  ]],
  handler: function(request, reply) {
    // get user
    var user = request.pre.currentUser;

    // build the user object from payload and params
    var updateUser = { id: user.id };
    if (request.payload.username) {
      updateUser.username = request.payload.username;
    }
    if (request.payload.email) {
      updateUser.email = request.payload.email;
    }
    if (request.payload.password && request.payload.confirmation) {
      updateUser.password = request.payload.password;
      updateUser.confirmation = request.payload.confirmation;
    }

    if (request.payload.name) {
      updateUser.name = request.payload.name;
    }

    if (request.payload.website) {
      updateUser.website = request.payload.website;
    }

    if (request.payload.btcAddress) {
      updateUser.btcAddress = request.payload.btcAddress;
    }

    if (request.payload.gender) {
      updateUser.gender = request.payload.gender;
    }

    if (request.payload.dob) {
      updateUser.dob = request.payload.dob;
    }

    if (request.payload.location) {
      updateUser.location = request.payload.location;
    }

    if (request.payload.language) {
      updateUser.language = request.payload.language;
    }

    if (request.payload.signature) {
      updateUser.signature = request.payload.signature;
    }

    if (request.payload.avatar) {
      updateUser.avatar = request.payload.avatar;
    }

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
