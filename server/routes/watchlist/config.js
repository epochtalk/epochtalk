var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {GET} /watchlist/unread Page Watchlist Unread
  * @apiName PageWatchlistUnread
  * @apiDescription Used to page through a user's watchlist filtered by threads with unread posts.
  *
  * @apiParam (Query) {number} page=1 The page of watchlist to bring back
  * @apiParam (Query) {number} limit=25 The number of threads to bring back per page
  *
  * @apiSuccess {array} threads An array of watchlist threads, page and limit
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the watchlist threads.
  */
exports.unread = {
  app: { action_type: 'watchlist.unread' },
  auth: { strategy: 'jwt' },
  validate: {
    query: {
      page: Joi.number().default(1),
      limit: Joi.number().integer().min(1).max(100).default(25)
    }
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var opts = {
      page: request.query.page,
      limit: request.query.limit
    };

    var promise = request.db.watchlist.unread(userId, opts)
    .then(function(threads) {
      var hasMoreThreads = false;
      if (threads.length > request.query.limit) {
        hasMoreThreads = true;
        threads.pop();
      }
      return {
        page: opts.page,
        limit: request.query.limit,
        threads: threads,
        hasMoreThreads: hasMoreThreads
      };
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {GET} /watchlist Edit Watchlist
  * @apiName EditWatchlist
  * @apiDescription Used to edit a user's watchlist.
  *
  * @apiParam (Query) {number} page=1 The page of watchlist to bring back
  * @apiParam (Query) {number} limit=25 The number of threads to bring back per page
  *
  * @apiSuccess {array} threads Two arrays of watchlist threads and boards
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the watchlist threads.
  */
exports.edit = {
  app: { action_type: 'watchlist.edit' },
  auth: { strategy: 'jwt' },
  validate: {
    query: {
      limit: Joi.number().integer().min(1).max(100).default(25)
    }
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var threadOpts = { page: 1, limit: request.query.limit };
    var boardOpts = { page: 1, limit: request.query.limit };

    var getThreads = request.db.watchlist.userWatchThreads(userId, threadOpts);
    var getBoards = request.db.watchlist.userWatchBoards(userId, boardOpts);

    var promise = Promise.join(getThreads, getBoards, function(threads, boards) {
      var hasMoreThreads = false, hasMoreBoards = false;
      if (threads.length > request.query.limit) {
        hasMoreThreads = true;
        threads.pop();
      }
      if (boards.length > request.query.limit) {
        hasMoreBoards = true;
        boards.pop();
      }
      return {
        page: 1,
        limit: request.query.limit,
        threads: threads,
        hasMoreThreads: hasMoreThreads,
        boards: boards,
        hasMoreBoards: hasMoreBoards
      };
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {GET} /watchlist Page Watchlist Threads
  * @apiName PageWatchlistThreads
  * @apiDescription Page though a user's watched threads
  *
  * @apiParam (Query) {number} page=1 The page of watchlist to bring back
  * @apiParam (Query) {number} limit=25 The number of threads to bring back per page
  *
  * @apiSuccess {array} threads An array of threads being watched
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the watchlist threads.
  */
exports.pageThreads = {
  app: { action_type: 'watchlist.pageThreads' },
  auth: { strategy: 'jwt' },
  validate: {
    query: {
      page: Joi.number().default(1),
      limit: Joi.number().integer().min(1).max(100).default(25)
    }
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var opts = {
      page: request.query.page,
      limit: request.query.limit
    };

    var promise = request.db.watchlist.userWatchThreads(userId, opts)
    .then(function(threads){
      var hasMoreThreads = false;
      if (threads.length > request.query.limit) {
        hasMoreThreads = true;
        threads.pop();
      }
      return {
        page: opts.page,
        limit: request.query.limit,
        threads: threads,
        hasMoreThreads: hasMoreThreads
      };
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {GET} /watchlist Page Watchlist Boards
  * @apiName PageWatchlistThreadsBoards
  * @apiDescription Page though a user's watched boards
  *
  * @apiParam (Query) {number} page=1 The page of watchlist to bring back
  * @apiParam (Query) {number} limit=25 The number of threads to bring back per page
  *
  * @apiSuccess {array} threads An array of boards being watched
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the watchlist threads.
  */
exports.pageBoards = {
  app: { action_type: 'watchlist.pageBoards' },
  auth: { strategy: 'jwt' },
  validate: {
    query: {
      page: Joi.number().default(1),
      limit: Joi.number().integer().min(1).max(100).default(25)
    }
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var opts = {
      page: request.query.page,
      limit: request.query.limit
    };

    var promise = request.db.watchlist.userWatchBoards(userId, opts)
    .then(function(boards) {
      var hasMoreBoards = false;
      if (boards.length > request.query.limit) {
        hasMoreBoards = true;
        boards.pop();
      }
      return {
        page: opts.page,
        limit: request.query.limit,
        boards: boards,
        hasMoreBoards: hasMoreBoards
      };
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {POST} /watchlist/threads/:id Watch Thread
  * @apiName WatchThread
  * @apiPermission User
  * @apiDescription Used to mark a user as watching a thread.
  *
  * @apiUse WatchlistObjectPayload
  * @apiUse WatchlistObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue watching the thread
  */
exports.watchThread = {
  auth: { strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: 'auth.watchThread(server, auth, params.id)' } ],
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var threadId = request.params.id;
    var promise = request.db.watchlist.watchThread(userId, threadId);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {DELETE} /watchlist/threads/:id Unwatch Thread
  * @apiName UnwatchThread
  * @apiPermission User
  * @apiDescription Used to unmark a user as watching a thread.
  *
  * @apiUse WatchlistObjectPayload
  * @apiUse WatchlistObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue unwatching the thread
  */
exports.unwatchThread = {
  app: { action_type: 'watchlist.unwatchThread' },
  auth: { strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var boardId = request.params.id;
    var promise = request.db.watchlist.unwatchThread(userId, boardId);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {POST} /watchlist/boards/:id Watch Board
  * @apiName WatchBoard
  * @apiPermission User
  * @apiDescription Used to mark a user as watching a board.
  *
  * @apiUse WatchlistObjectPayload
  * @apiUse WatchlistObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue watching the board
  */
exports.watchBoard = {
  auth: { strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: 'auth.watchBoard(server, auth, params.id)' }],
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var boardId = request.params.id;
    var promise = request.db.watchlist.watchBoard(userId, boardId);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {DELETE} /watchlist/boards/:id Unwatch Board
  * @apiName UnwatchBoard
  * @apiPermission User
  * @apiDescription Used to unmark a user as watching a board.
  *
  * @apiUse WatchlistObjectPayload
  * @apiUse WatchlistObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue unwatching the board
  */
exports.unwatchBoard = {
  app: { action_type: 'watchlist.unwatchBoard' },
  auth: { strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var boardId = request.params.id;
    var promise = request.db.watchlist.unwatchBoard(userId, boardId);
    return reply(promise);
  }
};

/**
  * @apiDefine WatchlistObjectPayload
  * @apiParam (Payload) {string} id The unique id of the model being watched
  */

/**
  * @apiDefine WatchlistObjectSuccess
  * @apiSuccess {Object} HTTP Code STATUS 200 OK
  */
