var Joi = require('joi');
var Boom = require('boom');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');

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
module.exports = {
  method: 'POST',
  path: '/api/login',
  config: {
    auth: { mode: 'try', strategy: 'jwt' },
    validate: {
      payload: {
        username: Joi.string().min(1).max(255).required(),
        password: Joi.string().min(8).max(255).required(),
        rememberMe: Joi.boolean().default(false)
      }
    }
  },
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      var loggedInUser = request.auth.credentials;
      return reply(request.session.formatUserReply(loggedInUser.token, loggedInUser));
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
        return request.db.bans.unban(user.id)
        .then(function(unbannedUser) {
          user.roles = unbannedUser.roles; // update user roles
          return user;
        });
      }
      else { return user; }
    })
    // Get Moderated Boards
    .then(function(user) {
      return request.db.moderators.getUsersBoards(user.id)
      .then(function(boards) {
        boards = boards.map(function(board) { return board.board_id; });
        user.moderating = boards;
        return user;
      });
    })
    .then(function(user) {
      if (rememberMe) { user.expiration = undefined; } // forever
      else { user.expiration = 1209600; } // 14 days
      return user;
    })
    // builds token, saves session, returns request output
    .then(request.session.save)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
