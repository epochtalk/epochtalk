var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var helper = require(path.normalize(__dirname + '/helper'));
var emailer = require(path.normalize(__dirname + '/../../emailer'));
var config = require(path.normalize(__dirname + '/../../../config'));

/**
  * @api {POST} /login Login
  * @apiName Login
  * @apiGroup Auth
  * @apiVersion 0.4.0
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
      password: Joi.string().min(8).max(72).required(),
      rememberMe: Joi.boolean().default(false)
    }
  },
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      var loggedInUser = request.auth.credentials;
      return reply(helper.formatUserReply(loggedInUser.token, loggedInUser));
    }

    var username = request.payload.username;
    var password = request.payload.password;
    var rememberMe = request.payload.rememberMe;
    var promise = request.db.users.userByUsername(username) // get full user info
    // check user exists
    .then(function(user) {
      if (user) { return user; }
      else { return Promise.reject(Boom.badRequest('Invalid Credentials')); }
    })
    // check confirmation token
    .then(function(user) {
      if (user.confirmation_token) {
        return Promise.reject(Boom.badRequest('Account Not Confirmed'));
      }
      else { return user; }
    })
    // check passhash exists (imported user only)
    .then(function(user) {
      if (user.passhash) { return user; }
      else { return Promise.reject(Boom.forbidden('Account Migration Not Complete, Please Reset Password')); }
    })
    // check if passhash matches
    .then(function(user) {
      if (bcrypt.compareSync(password, user.passhash)) { return user; }
      else { return Promise.reject(Boom.badRequest('Invalid Credentials')); }
    })
    // TODO: There could be a better place to do this
    // check if users ban expired and remove if it has
    .then(function(user) {
      if (user.ban_expiration && user.ban_expiration < new Date()) {
        return request.db.users.unban(user.id)
        .then(function(unbannedUser) {
          user.roles = unbannedUser.roles; // update user roles
          return user;
        });
      }
      else { return user; }
    })
    // get user moderating boards
    .then(function(user) {
      return request.db.moderators.getUsersBoards(user.id)
      .then(function(boards) {
        boards = boards.map(function(board) { return board.board_id; });
        user.moderating = boards;
      })
      .then(function() { return user; });
    })
    .then(function(user) {
      if (rememberMe) { user.expiration = undefined; } // forever
      else { user.expiration = 1209600; } // 14 days
      return user;
    })
    // builds token, saves session, returns request output
    .then(helper.saveSession);
    return reply(promise);
  }
};

/**
  * @api {DELETE} /logout Logout
  * @apiName Logout
  * @apiGroup Auth
  * @apiVersion 0.4.0
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
    if (!request.auth.isAuthenticated) { return reply(Boom.unauthorized()); }

    // deletes session, deletes user, no return
    var creds = request.auth.credentials;
    var promise = helper.deleteSession(creds.sessionId, creds.id);
    return reply(promise);
  }
};

/**
  * @api {POST} /register Register (w/o account verification)
  * @apiName RegisterNoVerify
  * @apiGroup Auth
  * @apiVersion 0.4.0
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
  * @apiVersion 0.4.0
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
      username: Joi.string().regex(/^[a-zA-Z\d-_.]+$/).min(3).max(255).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(72).required(),
      confirmation: Joi.ref('password')
    }
  },
  pre: [ { method: 'auth.auth.register(server, payload.email, payload.username)' } ],
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      var loggedInUser = request.auth.credentials;
      return reply(helper.formatUserReply(loggedInUser.token, loggedInUser));
    }

    var newUser = {
      username: request.payload.username,
      email: request.payload.email,
      password: request.payload.password,
      confirmation_token: config.verifyRegistration ? crypto.randomBytes(20).toString('hex') : null
    };
    // check that username or email does not already exist
    var promise = request.db.users.create(newUser)
    .then(function(user) {
      if (config.verifyRegistration) {  // send confirmation email
        var confirmUrl = config.publicUrl + '/' + path.join('confirm', user.username, user.confirmation_token);
        var emailParams = { email: user.email, username: user.username, confirm_url: confirmUrl };
        request.server.log('debug', emailParams);
        emailer.send('confirmAccount', emailParams);
        return {
          message: 'Successfully Created Account',
          username: user.username
        };
      }
      else { // Log user in after registering
        // builds token, saves session, returns request output
        return helper.saveSession(user);
      }
    });
    return reply(promise);
  }
};

/**
  * @api {POST} /confirm Confirm Account
  * @apiName Confirm Account
  * @apiGroup Auth
  * @apiVersion 0.4.0
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
    var promise = request.db.users.userByUsername(username) // get full user info
    .then(function(user) {
      if (user) { return user; }
      else { return Promise.reject(Boom.badRequest('Account Not Found')); }
    })
    .then(function(user) {
      var tokenMatch = confirmationToken === user.confirmation_token;
      if (user.confirmation_token && tokenMatch) {
        return request.db.users.update({ confirmation_token: null, id: user.id })
        .then(function() { return user; });
      }
      else { return Promise.reject(Boom.badRequest('Account Confirmation Error')); }
    })
    // get user moderating boards
    .then(function(user) {
      return request.db.moderators.getUsersBoards(user.id)
      .then(function(boards) {
        boards = boards.map(function(board) { return board.board_id; });
        user.moderating = boards;
      })
      .then(function() { return user; });
    })
    // builds token, saves session, returns request output
    .then(helper.saveSession);
    return reply(promise);
  }
};

/**
  * @api {GET} /authenticate Authenticate User
  * @apiName Authenticate User
  * @apiGroup Auth
  * @apiVersion 0.4.0
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
    var ret = Boom.unauthorized();
    if (request.auth.isAuthenticated) {
      var user = request.auth.credentials;
      ret = helper.formatUserReply(user.token, user);
    }
    return reply(ret);
  }
};

/**
  * @api {GET} /register/username/:username Username Availability
  * @apiName Username Availability
  * @apiGroup Auth
  * @apiVersion 0.4.0
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
    var promise = request.db.users.userByUsername(username) // get full user info
    .then(function(user) { return { found: !!user }; });
    return reply(promise);
  }
};

/**
  * @api {GET} /register/email/:email Email Availability
  * @apiName Email Availability
  * @apiGroup Auth
  * @apiVersion 0.4.0
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
    var promise = request.db.users.userByEmail(email) // get full user info
    .then(function(user) { return { found: !!user }; });
    return reply(promise);
  }
};

/**
  * @api {GET} /recover/:query Recover Account
  * @apiName AccountRecoveryReq
  * @apiGroup Auth
  * @apiVersion 0.4.0
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
    var promise = request.db.users.userByUsername(query) // get full user info
    .then(function(user) {
      if (user) { return user; }
      else { return Promise.reject(Boom.badRequest('No Account Found')); }
    })
    .catch(function() { return request.db.users.userByEmail(query); })
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
      return request.db.users.update(updateUser);
    })
    .then(function(user) {
      // Email user reset information here
      var emailParams = {
        email: user.email,
        username: user.username,
        reset_url: config.publicUrl + '/' + path.join('reset', user.username, user.reset_token)
      };
      return emailer.send('recoverAccount', emailParams);
    });
    return reply(promise);
  }
};

/**
  * @api {POST} /reset Reset Account Password
  * @apiName AccountRecoveryReset
  * @apiGroup Auth
  * @apiVersion 0.4.0
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
    var promise = request.db.users.userByUsername(username) // get full user info
    .then(function(user) {
      if (user) { return user; }
      else { return Promise.reject(Boom.badRequest('Account Not Found')); }
    })
    .then(function(user) {
      var now = Date.now();
      var tokenMatched = user.reset_token && user.reset_token === token;
      var expiryValid = user.reset_expiration && now < user.reset_expiration;
      if (tokenMatched && expiryValid) {
        return {
          id: user.id,
          reset_expiration: null,
          reset_token: null,
          confirmation_token: null,
          password: password
        };
      }
      else { return Promise.reject(Boom.badRequest('Invalid Reset Token.')); }
    })
    .then(request.db.users.update)
    .then(function() {
      // TODO: Send password reset confirmation email here
      return 'Password Successfully Reset';
    });
    return reply(promise);
  }
};

/**
  * @api {GET} /reset/:username/:token/validate Validate Account Reset Token
  * @apiName AccountRecoveryToken
  * @apiGroup Auth
  * @apiVersion 0.4.0
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
    var promise = request.db.users.userByUsername(username) // get full user info
    .then(function(user) {
      if (user) { return user; }
      else { return Promise.reject(Boom.badRequest('No Account Found.')); }
    })
    .then(function(user){
      var now = Date.now();
      var tokenValid = user.reset_token && user.reset_token === token;
      var tokenExpired =  user.reset_expiration && now > user.reset_expiration;
      return {
        token_valid: tokenValid,
        token_expired: tokenValid ? tokenExpired : undefined
      };
    })
    .catch(function() { return { token_valid: false }; });
    return reply(promise);
  }
};
