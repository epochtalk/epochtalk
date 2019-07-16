var Joi = require('joi');
var Boom = require('boom');
var Promise = require('bluebird');

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
  * @apiSuccess {string} token User's unique session token
  * @apiSuccess {string} id User's unique id
  * @apiSuccess {string} username User's username
  * @apiSuccess {string} avatar User's avatar url
  * @apiSuccess {string[]} roles Array of user's roles lookup strings
  * @apiSuccess {string[]} moderating Array of user's moderatered board ids
  * @apiSuccess {object} permissions Object containing user's permissions
  *
  * @apiError (Error 400) BadRequest Account was not found or confirmation token doesn't match
  * @apiError (Error 500) InternalServerError There was an issue confirming the user account
  */
module.exports = {
  method: 'POST',
  path: '/api/confirm',
  config: {
    validate: {
      payload: {
        username: Joi.string().min(1).max(255).required(),
        token: Joi.string().required()
      }
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
    // Get Moderated Boards
    .then(function(user) {
      return request.db.moderators.getUsersBoards(user.id)
      .then(function(boards) {
        boards = boards.map(function(board) { return board.board_id; });
        user.moderating = boards;
      })
      .then(function() { return user; });
    })
    // TODO: Move to post handler code
    .then(function(createdUser) {
      createdUser.avatar = '/static/img/avatar.png';
      var ip = request.headers['x-forwarded-for'] || request.info.remoteAddress;
      var opts = { ip: ip, userId: createdUser.id };
      return request.db.bans.getMaliciousScore(opts)
      .then(function(score) {
        // User has a malicious score less than 1 let them register
        if (score < 1) { return createdUser; }
        // User has a malicious score higher than 1 ban the account
        else {
          return request.db.bans.ban(createdUser.id)
          .then(function(banInfo) {
            createdUser.malicious_score = score;
            createdUser.roles = banInfo.roles;
            createdUser.ban_expiration = banInfo.expiration;
            return createdUser;
          });
        }
      });
    })
    // builds token, saves session, returns request output
    .then(request.session.save)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
