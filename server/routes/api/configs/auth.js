var core = require('epochcore')();
var Hapi = require('hapi');
var Promise = require('bluebird');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var redis = require('redis');
var path = require('path');
var config = require(path.join(__dirname, '..', '..', '..', 'config'));
var redisClient = redis.createClient(config.redis.port, config.redis.host);
var authSchema = require(path.join('..', 'schema', 'auth'));

exports.login = {
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      // reply with original token
      return reply({ token: request.auth.credentials.token });
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
      redisClient.set(user.id, token, function(err) {
        if (err) { throw new Error(err); }
        return reply({ token: token }); // return token to user
      });
    })
    .catch(function(err) {
      var error = Hapi.error.badRequest(err.message);
      error.output.statusCode = errorCode;
      error.reformat();
      return reply(error);
    });
  },
  auth: {
    mode: 'try',
    strategy: 'jwt'
  },
  validate: {
    payload: authSchema.validateLogin
  }
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

    // delete jwt from redis 
    redisClient.del(id, function(err, value) {
      if (err) {
        var error = Hapi.error.internal(err.message);
        return reply(error);
      }
      return reply(true);
    });
  },
  auth: {
    mode: 'try',
    strategy: 'jwt'
  }
};

exports.register = {
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      // reply with original token
      return reply({ token: request.auth.credentials.token });
    }

    var username = request.payload.username;
    var email = request.payload.email;
    var newUser = {
      username: username,
      email: email,
      password: request.payload.password,
      confirmation: request.payload.confirmation
    };

    // check that username or email does not already exist
    var errorCode = 500;
    var usernameFound = false;
    var emailFound = false;
    var usernameCheck = core.users.userByUsername(username);
    var emailCheck = core.users.userByEmail(email);
    return Promise.join(usernameCheck, emailCheck,
      function(usernameUser, emailUser) {
        if (usernameUser) { usernameFound = true; }
        if (emailUser) { emailFound = true; }
      }
    )
    .catch(function(err) { /* expecting this */ })
    .then(function() {
      var errorMessage = '';
      if (usernameFound) { errorMessage += 'Username Already Taken. '; }
      if (emailFound) { errorMessage += 'Email Already Taken'; }
      if (errorMessage.length > 0) {
        errorCode = 400;
        throw new Error(errorMessage);
      }
    })
    .then(function() { // insert user
      return core.users.create(newUser);
    })
    .then(function(user) { // build and save token
      var token = buildToken(user);
      redisClient.set(user.id, token, function(err) {
        if (err) { throw new Error(err); }
        return reply({ token: token }); // return token to user
      });
    })
    .catch(function(err) {
      // catch any errors along the way
      var error = Hapi.error.badRequest(err.message);
      error.output.statusCode = errorCode;
      error.reformat();
      return reply(error);
    });
  },
  auth: {
    mode: 'try',
    strategy: 'jwt'
  },
  validate: {
    payload: authSchema.validateRegister
  }
};

exports.username = {
  handler: function(request, reply) {
    var username = request.params.username;

    core.users.userByUsername(username)
    .then(function(user) {
      reply({ found: true });
    })
    .catch(function(err) {
      reply({ found: false });
    });
  }
};

exports.email = {
  handler: function(request, reply) {
    var email = request.params.email;

    core.users.userByEmail(email)
    .then(function(user) {
      reply({ found: true });
    })
    .catch(function(err) {
      reply({ found: false});
    });
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