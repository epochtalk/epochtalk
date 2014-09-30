var core = require('epochcore')();
var Hapi = require('hapi');
var Promise = require('bluebird');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var path = require('path');
var config = require(path.join(__dirname, '..', '..', '..', 'config'));
var authSchema = require(path.join('..', 'schema', 'auth'));
var memDb = require(path.join('..', '..', '..', 'memStore')).db;
var pre = require(path.join('..', 'pre', 'auth'));

exports.login = {
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      var loggedInUser = request.auth.credentials;
      var loginReply = {
        token: loggedInUser.token,
        username: loggedInUser.username,
        userId: loggedInUser.id
      };
      return reply(loginReply);
    }

    // check if user exists
    var errorCode = 500;
    var username = request.payload.username;
    var password = request.payload.password;
    return core.users.userByUsername(username)
    .catch(function(err) {
      errorCode = 400;
      throw new Error('Invalid Credentials');
    })
    .then(function(user) { // check if passhash matches
      if (bcrypt.compareSync(password, user.passhash)) {
        return user;
      }
      else {
        errorCode = 400;
        throw new Error('Invalid Credentials');
      }
    })
    .then(function(user) { // build and save token
      var token = buildToken(user);
      memDb.put(user.id, token, function(err) {
        if (err) { throw new Error(err); }
        var userReply = {
          token: token,
          username: user.username,
          userId: user.id
        };
        return reply(userReply);
      });
    })
    .catch(function(err) {
      var error = Hapi.error.badRequest(err.message);
      error.output.statusCode = errorCode;
      error.reformat();
      return reply(error);
    });
  },
  auth: { mode: 'try', strategy: 'jwt' },
  validate: { payload: authSchema.validateLogin }
};

exports.logout = {
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (!request.auth.isAuthenticated) {
      var error = Hapi.error.badRequest('Not Logged In');
      return reply(error);
    }

    var credentials = request.auth.credentials;
    var id = credentials.id;

    // delete jwt from memdown 
    memDb.del(id, function(err, value) {
      if (err) {
        var error = Hapi.error.internal(err.message);
        return reply(error);
      }

      return reply(true);
    });
  },
  auth: { mode: 'try', strategy: 'jwt' }
};

exports.register = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: { payload: authSchema.validateRegister },
  pre: [
    [
      { method: pre.checkEmail },
      { method: pre.checkUsername }
    ]
  ],
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      var loggedInUser = request.auth.credentials;
      var loginReply = {
        token: loggedInUser.token,
        username: loggedInUser.username,
        userId: loggedInUser.id
      };
      return reply(loginReply);
    }

    var newUser = {
      username: request.payload.username,
      email: request.payload.email,
      password: request.payload.password,
      confirmation: request.payload.confirmation
    };

    // check that username or email does not already exist
    return core.users.create(newUser)
    .then(function(user) { // build and save token
      var token = buildToken(user);
      memDb.put(user.id, token, function(err) {
        if (err) { throw new Error(err); }
        var userReply = {
          token: token,
          username: user.username,
          userId: user.id
        };
        return reply(userReply);
      });
    })
    .catch(function(err) {
      return reply(Hapi.error.internal('Registration Error', err));
    });
  }
};

exports.isAuthenticated = {
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      return reply({ authenticated: true });
    }
    else {
      reply({ authenticated: false }).header('Authorization', 'Revoked');
    }

  },
  auth: { mode: 'try', strategy: 'jwt' }
};

exports.username = {
  handler: function(request, reply) {
    var username = request.params.username;
    core.users.userByUsername(username)
    .then(function(user) { reply({ found: true }); })
    .catch(function(err) { reply({ found: false }); });
  }
};

exports.email = {
  handler: function(request, reply) {
    var email = request.params.email;
    core.users.userByEmail(email)
    .then(function(user) { reply({ found: true }); })
    .catch(function(err) { reply({ found: false}); });
  }
};

exports.refreshToken = {
  handler: function(request, reply) {
    return reply(true);
  }
};

// helper methods

var buildToken = function(user) {
  // create token
  var decodedToken = {
    id: user.id,
    username: user.username,
    email: user.email
    // token expiration
  };

  // build jwt token from decodedToken and privateKey
  return jwt.sign(decodedToken, config.privateKey);
};