var Joi = require('joi');
var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var Promise = require('bluebird');
var db = require(path.normalize(__dirname + '/../../../db'));
var emailer = require(path.normalize(__dirname + '/../../emailer'));
var config = require(path.normalize(__dirname + '/../../../config'));
var redis = require(path.normalize(__dirname + '/../../../redis'));
var pre = require(path.normalize(__dirname + '/pre'));

var buildToken = function(user) {
  // create token
  var decodedToken = {
    id: user.id,
    username: user.username,
    email: user.email
  };
  // TODO: handle token expiration?
  // build jwt token from decodedToken and privateKey
  return jwt.sign(decodedToken, config.privateKey, { algorithm: 'HS256' });
};

/**
  * @api {POST} /login Login
  * @apiName Login
  * @apiGroup Auth
  * @apiVersion 0.3.0
  * @apiDescription Used to log a user into their account.
  *
  * @apiParam (Payload) {string} username User's unique username
  * @apiParam (Payload) {string} password User's password
  *
  * @apiSuccess {string} token User's authentication token
  * @apiSuccess {string} username User's unique username
  * @apiSuccess {string} userId User's unique id
  *
  * @apiError BadRequest Invalid credentials were provided or the account hasn't been confirmed
  * @apiError (Error 500) InternalServerError There was an issue looking up the user in the db
  */
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

    var username = request.payload.username;
    var password = request.payload.password;
    return db.users.userByUsername(username)
    .then(function(user) { // check user exists
      if (user) { return user; }
      else { return Promise.reject(Boom.badRequest('Invalid Credentials')); }
    })
    .then(function(user) { // check confirmation token
      if (user.confirmation_token) {
        return Promise.reject(Boom.badRequest('Account Not Confirmed'));
      }
      else { return user; }
    })
    .then(function(user) { // check if passhash matches
      if (bcrypt.compareSync(password, user.passhash)) { return user; }
      else { return Promise.reject(Boom.badRequest('Invalid Credentials')); }
    })
    .then(function(user) { // build and save token
      var token = buildToken(user);
      var key = user.id + token;
      return redis.setAsync(key, token)
      .then(function() {
        var userReply = {
          token: token,
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          roles: user.roles
        };
        return reply(userReply);
      });
    })
    .catch(function(err) {
      if (err.isBoom) { return reply(err); }
      else return reply(Boom.badImplementation(err));
    });
  }
};

/**
  * @api {DELETE} /logout Logout
  * @apiName Logout
  * @apiGroup Auth
  * @apiVersion 0.3.0
  * @apiDescription Used to log a user out of their account.
  *
  * @apiSuccess {boolean} success true if user is successfully logged out
  *
  * @apiError BadRequest No user is currently logged in
  * @apiError (Error 500) InternalServerError There was an issue deleteing user's web token
  */
exports.logout = {
  auth: { mode: 'try', strategy: 'jwt' },
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (!request.auth.isAuthenticated) {
      return reply(Boom.badRequest('Not Logged In'));
    }

    // delete jwt from memdown
    var creds = request.auth.credentials;
    var key = creds.id + creds.token;
    redis.delAsync(key)
    .then(function(err) { return reply(true); })
    .catch(function(err) { return reply(Boom.badImplementation(err)); });
  }
};

/**
  * @api {POST} /register Register (w/o account verification)
  * @apiName RegisterNoVerify
  * @apiGroup Auth
  * @apiVersion 0.3.0
  * @apiDescription Used to register a new account with account verification disabled in admin settings.
  *
  * @apiParam (Payload) {string} username User's unique username.
  * @apiParam (Payload) {string} email User's email address.
  * @apiParam (Payload) {string} password User's password
  * @apiParam (Payload) {string} confirmation User's confirmed password
  *
  * @apiSuccess {string} token User's authentication token
  * @apiSuccess {string} id User's unique id
  * @apiSuccess {string} avatar User's avatar url
  * @apiSuccess {array} roles Array of user's roles
  *
  * @apiError BadRequest There was an error creating the user
  */
/**
  * @api {POST} /register Register (w/ account verification)
  * @apiName RegisterVerify
  * @apiGroup Auth
  * @apiVersion 0.3.0
  * @apiDescription Used to register a new account with account verification enabled in admin settings.
  * This will send an email to the user with the account verification link.
  *
  * @apiParam (Payload) {string} username User's unique username.
  * @apiParam (Payload) {string} email User's email address.
  * @apiParam (Payload) {string} password User's password
  * @apiParam (Payload) {string} confirmation User's confirmed password
  *
  * @apiSuccess {string} message Account creation success message
  * @apiSuccess {string} username Created user's username
  * @apiSuccess {string} confirm_token Created user's account confirmation token
  * @apiSuccess {string} confirm_url URL to visit to confirm user's account
  *
  * @apiError BadRequest There was an error creating the user
  */
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
      confirmation_token: config.verifyRegistration ? crypto.randomBytes(20).toString('hex') : null
    };
    // check that username or email does not already exist
    return db.users.create(newUser)
    .then(function(user) {
      if (config.verifyRegistration) {  // send confirmation email
        var confirmUrl = config.publicUrl + '/' + path.join('confirm', user.username, user.confirmation_token);
        var regReply = {
          statusCode: 200,
          message: 'Successfully Created Account',
          username: user.username,
          confirm_token: user.confirmation_token,
          confirm_url: confirmUrl
        };
        reply(regReply);
        var emailParams = {
          email: user.email, username: user.username, confirm_url: confirmUrl
        };
        request.server.log('debug', emailParams);
        emailer.send('confirmAccount', emailParams);
      }
      else { // Log user in after registering
        var token = buildToken(user);
        var key = user.id + token;
        redis.setAsync(key, token)
        .then(function() {
          var regReply = {
            token: token,
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            roles: user.roles
          };
          return reply(regReply);
        })
        .catch(function(err) { return reply(Boom.badImplementation(err)); });
      }
    })
    .catch(function(err) {
      return reply(Boom.badImplementation(err));
    });
  }
};

/**
  * @api {POST} /confirm Confirm Account
  * @apiName Confirm Account
  * @apiGroup Auth
  * @apiVersion 0.3.0
  * @apiDescription Used to confirm a newly registered account when account verification
  * is enabled in the admin panel.
  *
  * @apiParam (Payload) {string} username User's unique username.
  * @apiParam (Payload) {string} token User's confirmation token.
  *
  * @apiSuccess {string} token User's authentication token
  * @apiSuccess {string} id User's unique id
  * @apiSuccess {string} avatar User's avatar url
  * @apiSuccess {array} roles Array of user's roles
  *
  * @apiError BadRequest Account was not found or confirmation token doesn't match
  * @apiError (Error 500) InternalServerError There was an issue looking up the user in the db
  */
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
      if (user) { return user; }
      else { return Promise.reject(Boom.badRequest('Account Not Found')); }
    })
    .then(function(user) {
      var tokenMatch = confirmationToken === user.confirmation_token;
      if (user.confirmation_token && tokenMatch) {
        return db.users.update({ confirmation_token: null, id: user.id });
      }
      else {
        return Promise.reject(Boom.badRequest('Account Confirmation Error'));
      }
    })
    .then(function(updatedUser) {
      var authToken = buildToken(updatedUser);
      var key = updatedUser.id + authToken;
      return redis.setAsync(key, authToken)
      .then(function() {
        var userReply = {
          token: authToken,
          id: updatedUser.id,
          username: updatedUser.username,
          roles: updatedUser.roles
        };
        return reply(userReply);
      });
    })
    .catch(function(err) {
      if (err.isBoom) { return reply(err); }
      else { return reply(Boom.badImplementation(err)); }
    });
  }
};

/**
  * @api {GET} /authenticate Authenticate User
  * @apiName Authenticate User
  * @apiGroup Auth
  * @apiVersion 0.3.0
  * @apiDescription Used to check the logged in user's authentication.
  *
  * @apiSuccess {string} id User's unique id
  * @apiSuccess {string} username User's username
  * @apiSuccess {string} avatar User's avatar url
  * @apiSuccess {array} roles Array of user's roles
  *
  * @apiError Unauthorized returned when user is not authenticated
  */
exports.authenticate = {
  auth: { mode: 'try', strategy: 'jwt' },
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      var userId = request.auth.credentials.id;
      return db.users.find(userId)
      .then(function(user) {
        var retUser = {
          id: user.id,
          username: user.username,
          roles: user.roles,
          avatar: user.avatar
        };
        return reply(retUser);
      })
      .catch(function() { return reply(Boom.unauthorized()); });
    }
    else { return reply(Boom.unauthorized()); }
  }
};

/**
  * @api {GET} /register/username/:username Username Availability
  * @apiName Username Availability
  * @apiGroup Auth
  * @apiVersion 0.3.0
  * @apiDescription Used to check if a username is available when registering a new account.
  *
  * @apiParam {string} username The username to check
  *
  * @apiSuccess {boolean} found true if username exists false if not
  */
exports.username = {
  validate: { params: { username: Joi.string().min(1).max(255).required() } },
  handler: function(request, reply) {
    var username = request.params.username;
    db.users.userByUsername(username)
    .then(function(user) {
      var found = !!user;
      reply({ found: found });
    })
    .catch(function() { reply({ found: false }); });
  }
};

/**
  * @api {GET} /register/email/:email Email Availability
  * @apiName Email Availability
  * @apiGroup Auth
  * @apiVersion 0.3.0
  * @apiDescription Used to check if an email is available when registering a new account.
  *
  * @apiParam {string} email The email to check
  *
  * @apiSuccess {boolean} found true if email exists false if not
  */
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


/**
  * @api {GET} /recover/:query Recover Account
  * @apiName AccountRecoveryReq
  * @apiGroup Auth
  * @apiVersion 0.3.0
  * @apiDescription Used to recover an account by username or email. Sends an email with
  * a URL to visit to reset the user's account password.
  *
  * @apiParam {string} query The email or username to attempt to recover
  *
  * @apiSuccess {boolean} success true if recovery email is sent
  * @apiError BadRequest The username or email is not found
  * @apiError (Error 500) InternalServerError There was an error updating the user account's reset token information
  */
exports.recoverAccount = {
  validate: { params: { query: Joi.string().min(1).max(255).required(), } },
  handler: function(request, reply) {
    var query = request.params.query;
    db.users.userByUsername(query)
    .then(function(user) {
      if (user) { return user; }
      else { return Promise.reject(Boom.badRequest('No Account Found')); }
    })
    .catch(function() { return db.users.userByEmail(query); })
    .then(function(user) {
      if (user) { return user; }
      else { return Promise.reject(Boom.badRequest('No Account Found')); }
    })
    .then(function(user) {
      // Build updated user with resetToken and resetExpiration
      var updateUser = {};
      updateUser.reset_token = crypto.randomBytes(20).toString('hex');
      updateUser.reset_expiration = Date.now() + 1000 * 60 * 60; // 1 hr
      updateUser.id = user.id;
      // Store token and expiration to user object
      return db.users.update(updateUser);
    })
    .then(function(user) {
      // Email user reset information here
      var emailParams = {
        email: user.email,
        username: user.username,
        reset_url: config.publicUrl + '/' + path.join('reset', user.username, user.reset_token)
      };
      return emailer.send('recoverAccount', emailParams);
    })
    .then(function(success) { reply(success); })
    .catch(function(err) {
      if (err.isBoom) { return reply(err); }
      else { return reply(Boom.badImplementation(err)); }
    });
  }
};

/**
  * @api {POST} /reset Reset Account Password
  * @apiName AccountRecoveryReset
  * @apiGroup Auth
  * @apiVersion 0.3.0
  * @apiDescription Used to reset an account password after recovering an account.
  *
  * @apiParam (Payload) {string} username The username of the user whose password is being reset
  * @apiParam (Payload) {string} password The new account password
  * @apiParam (Payload) {string} query The new account password confirmation
  * @apiParam (Payload) {string} token The token for resetting the account password
  *
  * @apiSuccess {string} message Password Successfully Reset
  *
  * @apiError BadRequest The user account could not be found or the reset token is invalid
  * @apiError (Error 500) InternalServerError There was an error updating the user account's reset token information
  */
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
    var token = request.payload.token;
    db.users.userByUsername(username)
    .then(function(user) {
      if (user) { return user; }
      else { return Promise.reject(Boom.badRequest('Account Not Found')); }
    })
    .then(function(user) {
      var now = Date.now();
      var tokenMatched = user.reset_token && user.reset_token === token;
      var expiryValid = user.reset_expiration && now < user.reset_expiration;
      if (tokenMatched && expiryValid) {
        var updateUser = {};
        updateUser.id = user.id;
        updateUser.reset_expiration = null;
        updateUser.reset_token = null;
        updateUser.password = password;
        return updateUser;
      }
      else { return Promise.reject(Boom.badRequest('Invalid reset token.')); }
    })
    .then(db.users.update)
    .then(function(updatedUser) {
      // TODO: Send password reset confirmation email here
      return reply('Password Successfully Reset');
    })
    .catch(function(err) {
      if (err.isBoom) { return reply(err); }
      else { return reply(Boom.badImplementation(err)); }
    });
  }
};


/**
  * @api {GET} /reset/:username/:token/validate Validate Account Reset Token
  * @apiName AccountRecoveryToken
  * @apiGroup Auth
  * @apiVersion 0.3.0
  * @apiDescription Used to check the validity of the reset token. Verifys that the reset
  * token is for the correct user and that it is not expired.
  *
  * @apiParam {string} username The username of the user whose reset token is to be checked
  * @apiParam {string} token The token for resetting the account password
  *
  * @apiSuccess {boolean} token_valid true if the token is valid false if it is not
  * @apiSuccess {boolean} token_expired true if token is expired false if not. Undefined if token is invalid
  *
  * @apiError BadRequest The user account could not be found
  */
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
      if (!user) { return reply(Boom.badRequest('No Account Found.')); }
      var now = Date.now();
      var tokenValid = user.reset_token && user.reset_token === token;
      var tokenExpired =  user.reset_expiration && now > user.reset_expiration;
      var ret = {
        token_valid: tokenValid,
        token_expired: tokenValid ? tokenExpired : undefined
      };
      return reply(ret);
    })
    .catch(function() { return reply({ token_valid: false }); });
  }
};

exports.refreshToken = {
  handler: function(request, reply) { return reply(true); }
};
