var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Moderators
  * @api {POST} /admin/moderators Add Moderator
  * @apiName AddModerator
  * @apiPermission Super Administrator, Administrator,
  * @apiDescription Add a moderator to a board.
  *
  * @apiParam (Payload) {string[]} usernames Array of usernames to add as a moderator.
  * @apiParam (Payload) {string} board_id The id of the board to add the moderator to.
  *
  * @apiSuccess {object[]} moderators Array of users who were added as moderators
  * @apiSuccess {string} moderators.id The unique id of the moderator
  * @apiSuccess {string} moderators.username The username of the moderator
  * @apiSuccess {object[]} moderators.roles Array of the users roles, including new moderator role
  *
  * @apiError (Error 500) InternalServerError There was an issue adding the moderator.
  */
module.exports = {
  method: 'POST',
  path: '/api/admin/moderators',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
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
    pre: [ { method: (request) => request.server.methods.auth.moderators.add(request.server, request.auth) } ]
  },
  handler: function(request) {
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
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
