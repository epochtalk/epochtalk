/**
  * @apiVersion 0.4.0
  * @apiGroup Boards
  * @api {GET} /boards/move Move Boards
  * @apiName MoveBoard
  * @apiDescription Used to find all possible boards to move a thread to.
  *
  * @apiSuccess {object[]} boards Array containing all of the forums boards
  * @apiSuccess {string} boards.parent_id The board's parent board or category id
  * @apiSuccess {string} boards.parent_name The board's parent board or category name
  * @apiSuccess {string} boards.id The board's unique id
  * @apiSuccess {string} boards.name The board's name
  * @apiSuccess {number} boards.view_order The view order of the board
  *
  * @apiError (Error 500) InternalServerError There was an issue finding all boards
  */
module.exports = {
  method: 'GET',
  path: '/api/boards/movelist',
  config: {
    auth: { strategy: 'jwt' },
    pre: [ { method: (request) => request.server.methods.auth.boards.moveList(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var promise = request.db.boards.allSelect()
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
