/**
  * @apiVersion 0.4.0
  * @apiGroup Boards
  * @api {GET} /boards/uncategorized All Boards
  * @apiName AllBoard
  * @apiDescription Used to find all boards.
  *
  * @apiSuccess {object[]} boards Array containing all of the forums boards
  * @apiSuccess {string} boards.id The board's unique id
  * @apiSuccess {string} boards.name The board's name
  * @apiSuccess {string} boards.description The board's description
  * @apiSuccess {number} boards.viewable_by Minimum priority a user must have to view the board, null if no restriction
  * @apiSuccess {number} boards.postable_by Minimum priority a user must have to post in the board, null if no restriction
  * @apiSuccess {timestamp} boards.created_at Created at date for board
  * @apiSuccess {timestamp} boards.updated_at Last time the board was updated
  * @apiSuccess {timestamp} boards.imported_at If the board was imported at, the
  *
  * @apiError (Error 500) InternalServerError There was an issue finding all boards
  */
module.exports = {
  method: 'GET',
  path: '/api/boards/uncategorized',
  config: {
    auth: { strategy: 'jwt' },
    pre: [ { method: 'auth.boards.allUncategorized(server, auth)' } ]
  },
  handler: function(request, reply) {
    var promise = request.db.boards.all()
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
