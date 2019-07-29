var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Boards
  * @api {POST} /boards/all Update All Boards Categorized
  * @apiName UpdateBoardsInCategories
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to update all boards within their categories.
  *
  * @apiParam (Payload) {object[]} boardMapping Array containing mapping of boards and categories
  * @apiParam (Payload) {string} boardMapping.id The id of the category or board
  * @apiParam (Payload) {string} boardMapping.name The name of the category or board
  * @apiParam (Payload) {string="board","category","uncategorized"} boardMapping.type The type of the mapping object
  * @apiParam (Payload) {number} boardMapping.view_order The view order of the board or category
  * @apiParam (Payload) {string} [boardMapping.category_id] If type is "board" the id of the category the board belongs to
  * @apiParam (Payload) {string} [boardMapping.parent_id] If type is "board" and the board is a child board, the id of the parent board
  *
  * @apiSuccess {array} operations Array containing all of the operations performed while updating categories
  *
  * @apiError (Error 500) InternalServerError There was an issue updating categories/boards
  */
module.exports = {
  method: 'POST',
  path: '/api/boards/all',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: { type: 'adminBoards.updateCategories' }
    },
    validate: { payload: { boardMapping: Joi.array().required() } },
    pre: [ { method: (request) => request.server.methods.auth.boards.updateAll(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    // TODO: clean inputs?
    // update board on db
    var boardMapping = request.payload.boardMapping;
    var promise = request.db.boards.updateAll(boardMapping)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
