var core = require('epochcore')();
var Hapi = require('hapi');
var Promise = require('bluebird');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var redis = require('redis');
var path = require('path');
var config = require(path.join(__dirname, '..', '..', '..', 'config'));
var redisClient = redis.createClient(config.redis.port, config.redis.host);
// var authSchema = require(path.join('..', 'schema', 'auth'));

exports.login = {
  handler: function(request, reply) {

    console.log(request.auth);

    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      // reply with token
      return reply(request.auth.credentials.token);
    }

    // input validation (username and password)
    if (!request.payload.username || !request.payload.password) {
      var message = 'Missing usernmae or password';
      var inputError = Hapi.error.badRequest(message);
      return reply(inputError);
    }

    // check if user exists
    var username = request.payload.username;
    var password = request.payload.password;
    var errorCode = 500;
    return core.users.userByUsername(username)
    .catch(function(err) {
      errorCode = 400;
      throw new Error('User not found');
    })
    .then(function(user) {
      // check if passhash matches
      if (bcrypt.compareSync(password, user.passhash)) {
        return user;
      }
      else {
        errorCode = 400;
        throw new Error('Invalid Crendentials');
      }
    })
    .then(function(user) {
      // decodedToken: what we're going to encode into the token
      var decodedToken = {
        id: user.id,
        username: user.username,
        email: user.email
      };

      // build jwt token from user
      var token = jwt.sign(decodedToken, config.privateKey);

      // save token to redis
      redisClient.set(user.id, token, function(err) {
        if (err) { throw new Error(err); }

        // return token to user
        return reply(token);
      });
    })
    .catch(function(err) {
      console.log(err);
      var error = Hapi.error.badRequest(err.message);
      error.output.statusCode = errorCode;
      error.reformat();
      return reply(error);
    });
  },
  auth: {
    mode: 'try',
    strategy: 'jwt'
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

    console.log(request.auth);

    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      // reply with token
      return reply(request.auth.credentials.token);
    }

    // input validation (username and password)
    if (!request.payload.username ||
        !request.payload.email ||
        !request.payload.password ||
        !request.payload.confirmation) {
      var message = 'Missing username or password or email';
      var inputError = Hapi.error.badRequest(message);
      return reply(inputError);
    }

    // check that password and confirmation match
    if (request.payload.password !== request.payload.confirmation) {
      var errMessage = 'Password and Confirmation do not match';
      var passwordError = Hapi.error.badRequest(errMessage);
      return reply(passwordError);
    }

    var username = request.payload.username;
    var email = request.payload.email;
    var password = request.payload.password;
    var confirmation = request.payload.confirmation;

    var newUser = {
      username: username,
      email: email,
      password: password,
      confirmation: confirmation
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
    .catch(function(err) {
      console.log('Username Email Check error');
      console.log(err);
    })
    .then(function() {
      console.log("error checking");
      var errorMessage = '';
      if (usernameFound) { errorMessage += 'Username Already Taken. '; }
      if (emailFound) { errorMessage += 'Email Already Taken'; }
      if (errorMessage.length > 0) {
        errorCode = 400;
        throw new Error(errorMessage);
      }
    })
    .then(function() {
      // insert user
      return core.users.create(newUser);
    })
    .then(function(user) {
      // create token
      var decodedToken = {
        id: user.id,
        username: username,
        email: email
      };
      var token = jwt.sign(decodedToken, config.privateKey);

      // save token to redis
      redisClient.set(user.id, token, function(err) {
        if (err) { throw new Error(err); }

        // return token to user
        return reply(token);
      });
    })
    .catch(function(err) {
      console.log(err);
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
  }
};

exports.refreshToken = {
  handler: function(request, reply) {
    return reply(true);
  }
};