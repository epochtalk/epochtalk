var Joi = require('joi');
var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var db = require(path.normalize(__dirname + '/../../../db'));
var emailer = require(path.normalize(__dirname + '/../../emailer'));
var config = require(path.normalize(__dirname + '/../../../config'));
var memDb = require(path.normalize(__dirname + '/../../memstore')).db;
var pre = require(path.normalize(__dirname + '/pre'));

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

exports.login = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: {
    payload: {
      username: Joi.string().min(1).max(255).required(),
      password: Joi.string().min(8).max(72).required()
    }
  },
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
    return db.users.userByUsername(username)
    .catch(function() {
      errorCode = 400;
      throw new Error('Invalid Credentials');
    })
    .then(function(user) { // check if passhash matches
      if (user && !user.confirmation_token && bcrypt.compareSync(password, user.passhash)) {
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
      var error = Boom.badRequest(err.message);
      error.output.statusCode = errorCode;
      error.reformat();
      return reply(error);
    });
  }
};

exports.logout = {
  auth: { mode: 'try', strategy: 'jwt' },
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (!request.auth.isAuthenticated) {
      var error = Boom.badRequest('Not Logged In');
      return reply(error);
    }

    var credentials = request.auth.credentials;
    var id = credentials.id;

    // delete jwt from memdown
    memDb.del(id, function(err) {
      if (err) {
        return reply(Boom.badImplementation(err));
      }
      return reply(true);
    });
  }
};

exports.register = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: {
    payload: {
      username: Joi.string().min(1).max(255).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(72).required(),
      confirmation: Joi.ref('password')
    }
  },
  pre: [
    [
      { method: pre.checkUniqueEmail },
      { method: pre.checkUniqueUsername }
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
      confirmation: request.payload.confirmation,
      confirmation_token: crypto.randomBytes(20).toString('hex')
    };
    // check that username or email does not already exist
    return db.users.create(newUser)
    .then(function(user) { // send confirmation email
      var confirmUrl = config.publicUrl + '/' + path.join('confirm', user.username, user.confirmation_token);
      reply({ statusCode: 200, message: 'Successfully Created Account',
        username: user.username,
        confirm_token: user.confirmation_token,
        confirm_url: confirmUrl
      });
      var emailParams = {
        email: user.email, username: user.username, confirm_url: confirmUrl
      };
      request.server.log('debug', emailParams);
      emailer.send('confirmAccount', emailParams);
    })
    .catch(function(err) {
      return reply(Boom.badImplementation(err));
    });
  }
};

exports.confirmAccount = {
  validate: {
    payload: {
      username: Joi.string().min(1).max(255).required(),
      token: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var username = request.payload.username;
    var confirmationToken = request.payload.token;
    db.users.userByUsername(username)
    .then(function(user) {
      if (!user || !user.confirmation_token || confirmationToken !== user.confirmation_token) {
        return reply(Boom.badRequest('Account Confirmation Error'));
      }
      return db.users.update({ confirmation_token: undefined, id: user.id });
    })
    .then(function(updatedUser) {
      var authToken = buildToken(updatedUser);
      memDb.put(updatedUser.id, authToken, function(err) {
        if (err) { throw new Error(err); }
        var userReply = {
          token: authToken,
          username: updatedUser.username,
          userId: updatedUser.id
        };
        reply(userReply);
      });
    })
    .catch(function() { reply(Boom.badRequest('Account Confirmation Error')); });
  }
};

exports.isAuthenticated = {
  auth: { mode: 'try', strategy: 'jwt' },
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      return reply({ authenticated: true });
    }
    else {
      reply({ authenticated: false }).header('Authorization', 'Revoked');
    }

  }
};

exports.username = {
  validate: { params: { username: Joi.string().min(1).max(255).required() } },
  handler: function(request, reply) {
    var username = request.params.username;
    db.users.userByUsername(username)
    .then(function(user) {
      var found = !!user;
      reply({ found: found });
    })
    .catch(function() {
      reply({ found: false });
    });
  }
};

exports.email = {
  validate: { params: { email: Joi.string().email().required() } },
  handler: function(request, reply) {
    var email = request.params.email;
    db.users.userByEmail(email)
    .then(function(user) {
      var found = !!user;
      reply({ found: found });
    })
    .catch(function() { reply({ found: false }); });
  }
};

exports.recoverAccount = {
  validate: {
    query: {
      query: Joi.string().min(1).max(255).required(),
    }
  },
  handler: function(request, reply) {
    var query = request.params.query;
    db.users.userByUsername(query)
    .catch(function() { return db.users.userByEmail(query); })
    .then(function(user) {
      if (!user) { throw new Error(); } // Will be caught by No Account Found error
      var updateUser = {};
      // Build updated user with resetToken and resetExpiration
      updateUser.reset_token = crypto.randomBytes(20).toString('hex');
      updateUser.reset_expiration = Date.now() + 1000 * 60 * 60; // 1 hr
      updateUser.id = user.id;

      // Store token and expiration to user object
      db.users.update(updateUser)
      .then(function(user) {
        // Email user reset information here
        var emailParams = {
          email: user.email,
          username: user.username,
          reset_url: config.publicUrl + '/' + path.join('reset', user.username, user.reset_token)
        };
        return emailer.send('recoverAccount', emailParams);
      })
      .then(function(success) {
        reply(success);
      })
      .catch(function(err) {
        reply(Boom.badImplementation(err));
      });
    })
    .catch(function() {
      var error = Boom.badRequest('No Account Found');
      reply(error);
    });
  }
};

exports.resetPassword = {
  validate: {
    payload: {
      username: Joi.string().min(1).max(255).required(),
      password: Joi.string().min(8).max(72).required(),
      confirmation: Joi.ref('password'),
      token: Joi.string().token().required()
    }
  },
  handler: function(request, reply) {
    var username = request.payload.username;
    var password = request.payload.password;
    var confirmation = request.payload.confirmation;
    var token = request.payload.token;
    db.users.userByUsername(username)
    .then(function(user) {
      if (!user) {
        return reply(Boom.badRequest('Password reset failed. No Account Found.'));
      }
      var now = Date.now();
      var tokenValid = user.reset_token === token;
      var tokenExpired =  now > user.reset_expiration;
      if (tokenValid && !tokenExpired) {
        var updateUser = {};
        updateUser.id = user.id;
        updateUser.reset_expiration = now;
        updateUser.password = password;
        updateUser.confirmation = confirmation;
        return db.users.update(updateUser)
        .then(function(updatedUser) {
          var response = {};
          response.statusCode = 200;
          response.message = 'Password successfully reset for user ' + updatedUser.username + '.';
          // Send password reset confirmation email here
          reply(response);
        })
        .catch(function(err) {
          reply(Boom.badRequest(err.message));
        });
      }
      else {
        reply(Boom.badRequest('Password reset failed. Invalid reset token.'));
      }
    });
  }
};

exports.checkResetToken = {
  validate: {
    params: {
      username: Joi.string().min(1).max(255).required(),
      token: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var username = request.params.username;
    var token = request.params.token;
    db.users.userByUsername(username)
    .then(function(user) {
      if (!user) {
        return reply(Boom.badRequest('No Account Found.'));
      }
      var now = Date.now();
      var tokenValid = user.reset_token === token;
      var tokenExpired =  now > user.reset_expiration;
      reply({ token_valid: tokenValid, token_expired: tokenValid ? tokenExpired : undefined });
    })
    .catch(function() { return reply({ token_valid: false }); });
  }
};

exports.refreshToken = {
  handler: function(request, reply) { return reply(true); }
};
