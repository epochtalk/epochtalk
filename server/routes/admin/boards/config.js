var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Categories
  * @api {GET} /admin/categories All Categories (Includes Private)
  * @apiName AdminCategoriesUnfiltered
  * @apiDescription Used to retrieve all boards within their respective categories not filtering private boards.
  *
  * @apiSuccess {array} categories Array containing all of the forums boards in their respective categories
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving categories
  */
exports.categories = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminBoards.categories' },
  handler: function(request, reply) {
    var promise =  request.db.boards.allCategories()
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Boards
  * @api {GET} /admin/boards All Boards
  * @apiName AllBoard
  * @apiDescription Used to find all boards.
  *
  * @apiSuccess {array} boards Array containing all of the forums boards
  *
  * @apiError (Error 500) InternalServerError There was an issue finding all boards
  */
exports.boards = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminBoards.boards' },
  handler: function(request, reply) {
    var promise = request.db.boards.all()
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Boards
  * @api {GET} /admin/boards/move Move Boards
  * @apiName MoveBoard
  * @apiDescription Used to find all possible boards to move a thread to.
  *
  * @apiSuccess {array} boards Array containing all of the forums boards
  *
  * @apiError (Error 500) InternalServerError There was an issue finding all boards
  */
exports.moveBoards = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminBoards.moveBoards' },
  handler: function(request, reply) {
    var promise = request.db.boards.allSelect()
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Categories
  * @api {POST} /boards/categories Update Categories
  * @apiName UpdateCategories
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to update boards within their categories.
  *
  * @apiParam (Payload) {object[]} boardMapping Array containing mapping of boards and categories
  * @apiParam (Payload) {string} boardMapping.id The id of the category or board
  * @apiParam (Payload) {string} boardMapping.name The name of the category or board
  * @apiParam (Payload) {string="board","category"} boardMapping.type The type of the mapping object
  * @apiParam (Payload) {number} boardMapping.view_order The view order of the board or category
  * @apiParam (Payload) {string} [boardMapping.category_id] If type is "board" the id of the category the board belongs to
  * @apiParam (Payload) {string} [boardMapping.parent_id] If type is "board" and the board is a child board, the id of the parent board
  *
  * @apiSuccess {array} operations Array containing all of the operations performed while updating categories
  *
  * @apiError (Error 500) InternalServerError There was an issue updating categories/boards
  */
exports.updateCategories = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminBoards.updateCategories',
    mod_log: { type: 'adminBoards.updateCategories' }
  },
  validate: { payload: { boardMapping: Joi.array().required() } },
  // TODO: clean inputs?
  handler: function(request, reply) {
    // update board on db
    var boardMapping = request.payload.boardMapping;
    var promise = request.db.boards.updateCategories(boardMapping)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
