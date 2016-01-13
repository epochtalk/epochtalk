var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));
var Promise = require('bluebird');

/**
  * @apiDefine BoardObjectSuccess
  * @apiSuccess {string} id The board's unique id
  * @apiSuccess {string} name The board's name
  * @apiSuccess {string} description The boards description
  * @apiSuccess {timestamp} created_at Timestamp of when the board was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the board was updated
  * @apiSuccess {timestamp} imported_at Timestamp of when the board was imported
  */

/**
  * @apiVersion 0.3.0
  * @apiGroup Boards
  * @api {POST} /boards Create
  * @apiName CreateBoard
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to create a new board
  *
  * @apiParam (Payload) {string} name The name of the board to be created
  * @apiParam (Payload) {string} description The description text for the board
  *
  * @apiUse BoardObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the board
  */
exports.create = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'boards.create' },
  validate: {
    payload: {
      name: Joi.string().min(1).max(255).required(),
      description: Joi.string().allow(''),
      viewable_by: Joi.number()
    }
  },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    return reply(db.boards.create(request.payload));
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Boards
  * @api {POST} /boards/:id Find
  * @apiName FindBoard
  * @apiDescription Used to find a board.
  *
  * @apiParam {string} id The id of the board to lookup
  *
  * @apiUse BoardObjectSuccess
  * @apiSuccess {number} thread_count Number of threads this board contains
  * @apiSuccess {number} post_count Number of posts this board contains
  * @apiSuccess {array} moderators Moderators of this board
  *
  * @apiError (Error 500) InternalServerError There was an issue finding the board
  */
exports.find = {
  app: { board_id: 'params.id' },
  auth: { mode:'try', strategy: 'jwt' },
  plugins: { acls: 'boards.find' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: pre.accessBoardWithBoardId } ],
  handler: function(request, reply) {
    return reply(db.boards.find(request.params.id));
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Categories
  * @api {GET} /boards All Categories
  * @apiName AllCategories
  * @apiDescription Used to retrieve all boards within their respective categories.
  * @apiParam (Query) {number} page=1 The page of threads to bring back
 * @apiParam (Query) {number} limit=25 The number of threads to bring back per page
  * @apiSuccess {object} containing boards: [categories Array containing all of the forums boards in their respective categories], threads: [recent threads Array]
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving categories
  */
exports.allCategories = {
  auth: { mode: 'try', strategy: 'jwt' },
  plugins: { acls: 'boards.allCategories' },
  validate: {
    query: {
      page: Joi.number().default(1),
      limit: Joi.number().integer().min(1).max(100).default(5)
    }
  },
  pre: [ { method: pre.userPriority, assign: 'priority' } ],
  handler: function(request, reply) {
    var userId;
    var priority = request.pre.priority;
    var opts = {
      hidePrivate: true,  // filter out private boards
      limit: request.query.limit,
      page: request.query.page
    };
    if (request.auth.isAuthenticated) { userId = request.auth.credentials.id; }

    var getAllCategories = db.boards.allCategories(priority, opts);
    var getRecentThreads = db.threads.recent(userId, priority, opts);
    var promise = Promise.join(getAllCategories, getRecentThreads, function(boards, threads) {
      return {
        boards: boards,
        threads: threads
      };
    });

    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Boards
  * @api {GET} /boards By Category
  * @apiName BoardsByCategory
  * @apiDescription Used to get a category's boards.
  *
  * @apiParam (Query) {string} category_id The category whose boards to get
  * @apiSuccess {array} threads An array containing boards for the requested category
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the boards
  */
exports.byCategory = {
  app: { category_id: 'query.category_id' },
  auth: { mode: 'try', strategy: 'jwt' },
  plugins: { acls: 'boards.byCategory' },
  validate: {
    query: {
      category_id: Joi.string().required()
    }
  },
  // pre: [ { method: pre.accessBoardWithBoardId } ],
  handler: function(request, reply) {
    var userId;
    if (request.auth.isAuthenticated) { userId = request.auth.credentials.id; }
    var categoryId = request.query.category_id;
    var promise = db.boards.byCategory(categoryId, userId);

    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
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
  plugins: { acls: 'boards.updateCategories' },
  validate: { payload: { boardMapping: Joi.array().required() } },
  handler: function(request, reply) {
    // update board on db
    var boardMapping = request.payload.boardMapping;
    var promise = db.boards.updateCategories(boardMapping);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Boards
  * @api {POST} /boards/:id Update
  * @apiName UpdateBoard
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to update an existing boards information.
  *
  * @apiParam {string} id The id of the board being updated
  *
  * @apiParam (Payload) {string} name The name of the board to be created
  * @apiParam (Payload) {string} description The description text for the board
  *
  * @apiUse BoardObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue updating the board
  */
exports.update = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'boards.update' },
  validate: {
    payload: {
      name: Joi.string().min(1).max(255),
      description: Joi.string().allow(''),
      viewable_by: Joi.number().allow(null)
    },
    params: { id: Joi.string().required() }
  },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    // build updateBoard object from params and payload
    var updateBoard = request.payload;
    updateBoard.id = request.params.id;

    // update board on db
    return reply(db.boards.update(updateBoard));
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Boards
  * @api {DELETE} /boards/:id Delete
  * @apiName DeleteBoard
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to delete an existing board from the forum.
  *
  * @apiParam {string} id The id of the board being deleted
  *
  * @apiUse BoardObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting the board
  */
exports.delete = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'boards.delete' },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    return reply(db.boards.delete(request.params.id));
  }
};
