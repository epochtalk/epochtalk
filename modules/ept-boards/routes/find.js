var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Boards
  * @api {GET} /boards/:id Find Board
  * @apiName FindBoard
  * @apiDescription Used to lookup a board
  *
  * @apiParam {string} id The id of the board to lookup
  *
  * @apiSuccess {string} id The id of the board
  * @apiSuccess {string} name The name of the board
  * @apiSuccess {string} parent_id The id of the parent board if applicable
  * @apiSuccess {number} viewable_by The minimum priority to be able to view the board, null for no restriction
  * @apiSuccess {number} postable_by The minimum priority to be able to post to the board, null for no restriction
  * @apiSuccess {string} description The board description text
  * @apiSuccess {number} thread_count The number of threads within the board
  * @apiSuccess {number} post_count The number of posts within the board
  * @apiSuccess {object[]} children An array containing child boards if applicable
  * @apiSuccess {object[]} moderators Array containing data about the moderators of the board
  * @apiSuccess {string} moderators.id The id of the moderator
  * @apiSuccess {string} moderators.username The username of the moderator
  * @apiSuccess {timestamp} created_at The created at timestamp of the board
  * @apiSuccess {timestamp} updated_at The updated at timestamp of the board
  * @apiSuccess {timestamp} imported_at The imported at timestamp of the board
  *
  * @apiError (Error 500) InternalServerError There was an issue finding the board
  */
module.exports = {
  method: 'GET',
  path: '/api/boards/{id}',
  config: {
    auth: { mode:'try', strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: (request) => request.server.methods.auth.boards.find(request.server, request.auth, request.params.id) } ]
  },
  handler: function(request, reply) {
    var boardId = request.params.id;
    var userPriority = request.server.plugins.acls.getUserPriority(request.auth);

    var promise = request.db.boards.find(boardId, userPriority)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
