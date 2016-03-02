var Joi = require('joi');
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
  * @apiVersion 0.4.0
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
  plugins: {
    acls: 'boards.create',
    mod_log: {
      type: 'boards.create',
      data: {
        name: 'payload.name',
        description: 'payload.description',
        viewable_by: 'payload.viewable_by'
      }
    },
  },
  validate: {
    payload: {
      name: Joi.string().min(1).max(255).required(),
      description: Joi.string().allow(''),
      viewable_by: Joi.number()
    }
  },
  pre: [ { method: 'common.boards.clean(sanitizer, payload)' } ],
  handler: function(request, reply) {
    return reply(request.db.boards.create(request.payload));
  }
};

/**
  * @apiVersion 0.4.0
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
  auth: { mode:'try', strategy: 'jwt' },
  plugins: { acls: 'boards.find' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: 'auth.boards.find(server, auth, params.id)' } ],
  handler: function(request, reply) {
    return reply(request.db.boards.find(request.params.id));
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Categories
  * @api {GET} /boards All Categories (Filters Private)
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
      limit: Joi.number().integer().min(1).max(100).default(5),
      stripped: Joi.boolean()
    }
  },
  pre: [ { method: 'auth.boards.allCategories(server, auth)', assign: 'priority' } ],
  handler: function(request, reply) {
    var userId;
    var priority = request.pre.priority;
    var opts = {
      hidePrivate: true,  // filter out private boards
      stripped: request.query.stripped, // only retrieve boards and categories no other metadata
      limit: request.query.limit,
      page: request.query.page
    };
    if (request.auth.isAuthenticated) { userId = request.auth.credentials.id; }

    var getAllCategories = request.db.boards.allCategories(priority, opts);
    var getRecentThreads = request.db.threads.recent(userId, priority, opts);

    var promise;
    if (opts.stripped) {
      promise = getAllCategories
      .then(function(boards) {
        return { boards: boards };
      });
    }
    else {
      promise = Promise.join(getAllCategories, getRecentThreads, function(boards, threads) {
        return {
          boards: boards,
          threads: threads
        };
      });
    }
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
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
  plugins: {
    acls: 'boards.update',
    mod_log: {
      type: 'boards.update',
      data: {
        id: 'params.id',
        name: 'payload.name',
        description: 'payload.description',
        viewable_by: 'payload.viewable_by'
      }
    }
  },
  validate: {
    payload: Joi.array().items(Joi.object().keys({
      id: Joi.string().required(),
      name: Joi.string().min(1).max(255),
      description: Joi.string().allow(''),
      viewable_by: Joi.number().allow(null)
    })).unique().min(1)
  },
  pre: [ { method: 'common.boards.clean(sanitizer, payload)' } ],
  handler: function(request, reply) {
    // update board on db
    var promise = Promise.map(request.payload, function(board) {
      return request.db.boards.update(board);
    });

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
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
  plugins: {
    acls: 'boards.delete',
    mod_log: {
      type: 'boards.delete',
      data: {
        id: 'params.id',
        name: 'route.settings.plugins.mod_log.metadata.name'
      }
    }
  },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    var promise = request.db.boards.delete(request.params.id)
    .then(function(result) {
      // store results on plugin metadata
      request.route.settings.plugins.mod_log.metadata = {
        name: result.name
      };

      return result;
    });
    return reply(promise);
  }
};
