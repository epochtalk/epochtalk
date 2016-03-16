var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Moderators
  * @api {POST} /admin/moderators Add Moderator
  * @apiName AddModerator
  * @apiPermission Super Administrator, Administrator,
  * @apiDescription Add a moderator to a board.
  *
  * @apiParam (Payload) {string[]} usernames Array of ids of the user to add as a moderator.
  * @apiParam (Payload) {string} board_id The id of the board to add the moderator to.
  *
  * @apiSuccess {object} STATUS 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an issue adding the moderator.
  */
exports.add = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminModerators.add',
    mod_log: {
      type: 'adminModerators.add',
      data: {
        usernames: 'payload.usernames',
        board_id: 'payload.board_id'
      }
    }
  },
  validate: {
    payload: {
      usernames: Joi.array().items(Joi.string().required()).unique().min(1).required(),
      board_id: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var usernames = request.payload.usernames;
    var boardId = request.payload.board_id;
    var promise = request.db.moderators.add(usernames, boardId)
    // update redis with new moderating boads
    .map(function(user) {
      return request.db.moderators.getUsersBoards(user.id)
      .then(function(moderating) {
        moderating = moderating.map(function(b) { return b.board_id; });
        var moderatingUser = { id: user.id, moderating: moderating };
        return request.session.updateModerating(moderatingUser)
        .then(function() { return user; });
      });
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Moderators
  * @api {POST} /admin/moderators/remove Remove Moderator
  * @apiName RemoveModerator
  * @apiPermission Super Administrator, Administrator,
  * @apiDescription Remove a moderator from a board.
  *
  * @apiParam (Payload) {string[]} username Array of user ids of the user to remove from being a moderator.
  * @apiParam (Payload) {string} board_id The id of the board to remove the moderator from.
  *
  * @apiSuccess {object} STATUS 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an issue removing the moderator.
  */
exports.remove = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminModerators.remove',
    mod_log: {
      type: 'adminModerators.remove',
      data: {
        usernames: 'payload.usernames',
        board_id: 'payload.board_id'
      }
    }
  },
  validate: {
    payload: {
      usernames: Joi.array().items(Joi.string().required()).unique().min(1).required(),
      board_id: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var usernames = request.payload.usernames;
    var boardId = request.payload.board_id;
    var promise = request.db.moderators.remove(usernames, boardId)
    // update redis with new moderating boads
    .map(function(user) {
      return request.db.moderators.getUsersBoards(user.id)
      .then(function(moderating) {
        moderating = moderating.map(function(b) { return b.board_id; });
        var moderatingUser = { id: user.id, moderating: moderating };
        return request.session.updateModerating(moderatingUser)
        .then(function() { return user; });
      });
    });
    return reply(promise);
  }
};
