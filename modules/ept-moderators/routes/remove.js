var Joi = require('joi');

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
  * @apiSuccess {object[]} moderators Array of users who were removed from list of moderators
  * @apiSuccess {string} moderators.id The unique id of the moderator
  * @apiSuccess {string} moderators.username The username of the moderator
  *
  * @apiError (Error 500) InternalServerError There was an issue removing the moderator.
  */
module.exports = {
  method: 'POST',
  path: '/api/admin/moderators/remove',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
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
    pre: [ { method: 'auth.moderators.remove(server, auth)' } ]
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
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
