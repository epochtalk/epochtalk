var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));
var postPre = require(path.normalize(__dirname + '/../posts/pre'));

/**
  * @apiVersion 0.3.0
  * @apiGroup Threads
  * @api {POST} /threads Create
  * @apiName CreateThread
  * @apiPermission User
  * @apiDescription Used to create a new thread.
  *
  * @apiUse ThreadObjectPayload
  * @apiUse ThreadObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the thread
  */
exports.create = {
  app: {
    board_id: 'payload.board_id',
    isPollCreatable: 'polls.create'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'threads.create' },
  validate: {
    payload: Joi.object().keys({
      locked: Joi.boolean().default(false),
      sticky: Joi.boolean().default(false),
      title: Joi.string().min(1).max(255).required(),
      body: Joi.string().allow(''),
      raw_body: Joi.string().required(),
      board_id: Joi.string().required(),
      poll: Joi.object().keys({
        question: Joi.string().required(),
        answers: Joi.array().items(Joi.string()).min(2).max(8).required()
      })
    })
  },
  pre: [
    [
      { method: pre.accessBoardWithBoardId },
      { method: pre.isRequesterActive },
      { method: pre.isPollCreatable }
    ],
    { method: postPre.clean },
    { method: postPre.parseEncodings },
    { method: postPre.subImages }
  ],
  handler: function(request, reply) {
    // build the thread post object from payload and params
    var user = request.auth.credentials;
    var newThread = {
      board_id: request.payload.board_id,
      locked: request.payload.locked,
      sticky: request.payload.sticky
    };
    var newPost = {
      title: request.payload.title,
      body: request.payload.body,
      raw_body: request.payload.raw_body,
      user_id: user.id
    };

    // create the thread
    var promise = db.threads.create(newThread)
    // save thread id to newPost
    .tap(function(thread) { newPost.thread_id = thread.id; })
    // create any associated polls
    .then(function(thread) {
      if (request.payload.poll) {
        var question = request.payload.poll.question;
        var answers = request.payload.poll.answers;

        return db.polls.create(thread.id, question, answers);
      }
    })
    // create the first post in this thread
    .then(function() { return db.posts.create(newPost); });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Threads
  * @api {POST} /threads/import Import
  * @apiName ImportThread
  * @apiPermission Super Administrator
  * @apiDescription Used to import an existing thread. Currently only SMF is supported.
  *
  * @apiUse ThreadObjectPayload
  * @apiParam (Payload) {object} smf Object containing SMF metadata
  * @apiParam (Payload) {number} smf.ID_BOARD Legacy smf board id
  * @apiParam (Payload) {number} smf.ID_TOPIC Legacy smf thread id
  *
  * @apiUse ThreadObjectSuccess
  * @apiSuccess {timestamp} updated_at Timestamp of when the thread was updated
  * @apiSuccess {timestamp} imported_at Timestamp of when the thread was imported
  *
  * @apiError (Error 500) InternalServerError There was an issue importing the thread
  */
exports.import = {
  // auth: { strategy: 'jwt' },
  // validate: {
  //   payload: Joi.object().keys({
  //     sticky: Joi.boolean().default(false),
  //     locked: Joi.boolean().default(false),
  //     board_id: Joi.string().required(),
  //     created_at: Joi.date(),
  //     updated_at: Joi.date(),
  //     view_count: Joi.number(),
  //     deleted: Joi.boolean(),
  //     smf: Joi.object().keys({
  //       ID_MEMBER: Joi.number(),
  //       ID_TOPIC: Joi.number(),
  //       ID_FIRST_MSG: Joi.number()
  //     })
  //   })
  // },
  handler: function(request, reply) {
    var promise = db.threads.import(request.payload)
    .catch(function(err) {
      request.log('error', 'Import board: ' + JSON.stringify(err, ['stack', 'message'], 2));
      reply(Boom.badImplementation(err));
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Threads
  * @api {GET} /threads Page By Board
  * @apiName PageThreadsByBoard
  * @apiDescription Used to page through a board's threads.
  *
  * @apiParam (Query) {string} board_id The board whose threads to page through
  * @apiParam (Query) {number} page=1 The page of threads to bring back
  * @apiParam (Query) {number} limit=25 The number of threads to bring back per page
  *
  * @apiSuccess {array} threads An array containing threads for the requested board, page and limit
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the threads
  */
exports.byBoard = {
  app: { board_id: 'query.board_id' },
  auth: { mode: 'try', strategy: 'jwt' },
  plugins: { acls: 'threads.byBoard' },
  validate: {
    query: {
      board_id: Joi.string().required(),
      page: Joi.number().default(1),
      limit: Joi.number().integer().min(1).max(100).default(25)
    }
  },
  pre: [ { method: pre.accessBoardWithBoardId } ],
  handler: function(request, reply) {
    var userId;
    if (request.auth.isAuthenticated) { userId = request.auth.credentials.id; }
    var boardId = request.query.board_id;
    var opts = {
      limit: request.query.limit,
      page: request.query.page
    };

    var getThreads = db.threads.byBoard(boardId, userId, opts);
    var getBoard = db.boards.find(boardId);
    var getBoardWatching = db.boards.watching(boardId, userId);

    var promise = Promise.join(getThreads, getBoard, getBoardWatching, function(threads, board, boardWatching) {
      // check if board is being Watched
      if (boardWatching) { board.watched = true; }

      return {
        board: board,
        page: opts.page,
        limit: opts.limit,
        normal: threads.normal,
        sticky: threads.sticky
      };
    });

    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Threads
  * @api {GET} /threads/:id Find
  * @apiName FindThread
  * @apiDescription Used to find an existing thread.
  *
  * @apiParam {string} id The unique id of the thread to find
  *
  * @apiUse ThreadObjectSuccess2
  *
  * @apiError (Error 500) InternalServerError There was an issue looking up the thread
  */
exports.viewed = {
  app: { thread_id: 'params.id' },
  auth: { mode: 'try', strategy: 'jwt' },
  plugins: { acls: 'threads.viewed' },
  validate: { params: { id: Joi.string().required() } },
  pre: [
    [ { method: pre.accessBoardWithThreadId } ],
    [
      { method: pre.checkViewValidity, assign: 'newViewId' },
      { method: pre.updateUserThreadViews }
    ]
  ],
  handler: function(request, reply) {
    var newViewerId = request.pre.newViewId;
    if (newViewerId) { return reply().header('Epoch-Viewer', newViewerId); }
    else { return reply(); }
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Threads
  * @api {GET} /threads/:id Title
  * @apiName UpdateThreadTitle
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator, User (Thread Author Only)
  * @apiDescription Used to update the title of a thread.
  *
  * @apiParam {string} id The unique id of the thread to lock
  * @apiParam (Payload) {string} The new title for this thread.
  *
  * @apiUse ThreadObjectSuccess2
  *
  * @apiError Unauthorized User doesn't have permissions to update the thread title.
  * @apiError (Error 500) InternalServerError There was an issue updating the thread title.
  */
exports.title = {
  app: {
    thread_id: 'params.id',
    isThreadOwner: 'threads.privilegedTitle'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'threads.title' },
  validate: {
    params: { id: Joi.string().required() },
    payload: { title: Joi.string().required().min(1) }
  },
  pre: [ [
    { method: pre.accessBoardWithThreadId },
    { method: pre.isRequesterActive },
    { method: pre.isThreadOwner },
    { method: pre.threadFirstPost, assign: 'post' }
  ] ],
  handler: function(request, reply) {
    var post = {
      id: request.pre.post.id,
      thread_id: request.params.id,
      title: request.payload.title
    };
    var promise = db.posts.update(post)
    .error(function() { return Boom.notFound(); });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Threads
  * @api {GET} /threads/:id/lock Lock
  * @apiName LockThread
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator, User (Thread Author Only)
  * @apiDescription Used to lock a thread and prevent any additional posts.
  *
  * @apiParam {string} id The unique id of the thread to lock
  * @apiParam (Payload) {boolean} status=true Boolean indicating lock status, true if locked false if unlocked.
  *
  * @apiUse ThreadObjectSuccess2
  *
  * @apiError Unauthorized User doesn't have permissions to lock the thread
  * @apiError (Error 500) InternalServerError There was an issue locking the thread
  */
exports.lock = {
  app: {
    thread_id: 'params.id',
    isThreadOwner: 'threads.privilegedLock'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'threads.lock' },
  validate: {
    params: { id: Joi.string().required() },
    payload: { status: Joi.boolean().default(true) }
  },
  pre: [ [
      { method: pre.accessBoardWithThreadId },
      { method: pre.isRequesterActive },
      { method: pre.isThreadOwner },
      { method: pre.getThread, assign: 'thread' }
    ] ],
  handler: function(request, reply) {
    var thread = request.pre.thread;
    thread.locked = request.payload.status;

    // lock thread
    var promise = db.threads.lock(thread.id, thread.locked)
    .then(function() { return thread; });

    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Threads
  * @api {GET} /threads/:id/sticky Sticky
  * @apiName StickyThread
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to sticky a thread. This will cause the thread to show up at the top of the board it's posted within.
  *
  * @apiParam {string} id The unique id of the thread to sticky
  * @apiParam (Payload) {boolean} status=true Boolean indicating sticky status, true if stickied false if not.
  *
  * @apiUse ThreadObjectSuccess2
  *
  * @apiError Unauthorized User doesn't have permissions to sticky the thread
  * @apiError (Error 500) InternalServerError There was an issue stickying the thread
  */
exports.sticky = {
  app: {
    thread_id: 'params.id',
    hasPermission: 'threads.privilegedSticky'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'threads.sticky' },
  validate: {
    params: { id: Joi.string().required() },
    payload: { status: Joi.boolean().default(true) }
  },
  pre: [ [
    { method: pre.hasPermission },
    { method: pre.getThread, assign: 'thread' }
  ] ],
  handler: function(request, reply) {
    var thread = request.pre.thread;
    thread.sticky = request.payload.status;

    // sticky thread
    var promise = db.threads.sticky(thread.id, thread.sticky)
    .then(function() { return thread; });

    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Threads
  * @api {GET} /threads/:id/move Move
  * @apiName MoveThread
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to move a thread to a different board.
  *
  * @apiParam {string} id The unique id of the thread to move
  * @apiParam (Payload) {string} newBoardId The unique id of the board to move this thread into.
  *
  * @apiUse ThreadObjectSuccess2
  *
  * @apiError BadRequest User attempted to move the thread to the same board it is already in
  * @apiError Unauthorized User doesn't have permissions to move the thread
  * @apiError (Error 500) InternalServerError There was an issue moving the thread
  */
exports.move = {
  app: {
    thread_id: 'params.id',
    hasPermission: 'threads.privilegedMove'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'threads.move' },
  validate: {
    params: { id: Joi.string().required() },
    payload: { newBoardId: Joi.string().required() }
  },
  pre: [ [
    { method: pre.hasPermission },
    { method: pre.getThread, assign: 'thread' }
  ] ],
  handler: function(request, reply) {
    var newBoardId = request.payload.newBoardId;
    var thread = request.pre.thread;
    thread.board_id = newBoardId;

    // move thread
    var promise = db.threads.move(thread.id, thread.board_id)
    .then(function() { return thread; })
    .error(function(err) { return Boom.badRequest(err.message); });

    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Threads
  * @api {DELETE} /threads/:id/purge Purge
  * @apiName PurgeThread
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to purge a thread.
  *
  * @apiParam {string} id The unique id of the thread to purge
  *
  * @apiUse ThreadObjectSuccess2
  *
  * @apiError Unauthorized User doesn't have permissions to purge the thread
  * @apiError (Error 500) InternalServerError There was an issue purging the thread
  */
exports.purge = {
  app: {
    thread_id: 'params.id',
    hasPermission: 'threads.privilegedPurge'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'threads.purge' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: pre.hasPermission } ],
  handler: function(request, reply) {
    var promise = db.threads.purge(request.params.id);
    return reply(promise);
  }
};

exports.vote = {
  app: { thread_id: 'params.threadId' },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'polls.vote' },
  validate: {
    params: {
      threadId: Joi.string().required(),
      pollId: Joi.string().required()
    },
    payload: { answerId: Joi.string().required() }
  },
  pre: [ [
      { method: pre.accessBoardWithThreadId },
      { method: pre.isRequesterActive },
      { method: pre.pollExists },
      { method: pre.canVote },
      { method: pre.isPollUnlocked }
    ] ],
  handler: function(request, reply) {
    var pollId = request.params.pollId;
    var answerId = request.payload.answerId;
    var userId = request.auth.credentials.id;
    var promise = db.polls.vote(pollId, answerId, userId);
    return reply(promise);
  }
};

exports.lockPoll = {
  app: {
    thread_id: 'params.threadId',
    poll_id: 'params.pollId',
    isPollOwner: 'polls.privilegedLock'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'polls.lock' },
  validate: {
    params: {
      threadId: Joi.string().required(),
      pollId: Joi.string().required()
    },
    payload: { lockValue: Joi.boolean().required() }
  },
  pre: [ [
      { method: pre.accessBoardWithThreadId },
      { method: pre.isRequesterActive },
      { method: pre.pollExists },
      { method: pre.isPollOwner }
    ] ],
  handler: function(request, reply) {
    var pollId = request.params.pollId;
    var lockValue = request.payload.lockValue;
    var promise = db.polls.lock(pollId, lockValue);
    return reply(promise);
  }
};

/**
  * @apiDefine ThreadObjectPayload
  * @apiParam (Payload) {string} title The title of the thread
  * @apiParam (Payload) {string} body The thread's body with any markup tags converted and parsed into html elements
  * @apiParam (Payload) {string} raw_body The thread's body as it was entered in the editor by the user
  * @apiParam (Payload) {string} board_id The unique id of the board this thread is being created within
  * @apiParam (Payload) {boolean} locked=false Boolean indicating whether the thread is locked or unlocked
  * @apiParam (Payload) {boolean} sticky=false Boolean indicating whether the thread is stickied or not
  */

/**
  * @apiDefine ThreadObjectSuccess
  * @apiSuccess {string} id The unqiue id of the post the thread is wrapping
  * @apiSuccess {string} thread_id The unqiue id of the thread
  * @apiSuccess {string} user_id The unique id of the user who created the thread
  * @apiSuccess {string} title The title of the thread
  * @apiSuccess {string} body The thread's body with any markup tags converted and parsed into html elements
  * @apiSuccess {string} raw_body The thread's body as it was entered in the editor by the user
  * @apiSuccess {timestamp} created_at Timestamp of when the thread was created
  */

/**
  * @apiDefine ThreadObjectSuccess2
  * @apiSuccess {string} id The unique id of the thread
  * @apiSuccess {string} board_id The unique id of the board the thread belongs to
  * @apiSuccess {string} title The title of the thread
  * @apiSuccess {boolean} locked Boolean indicating whether or not the thread is locked
  * @apiSuccess {boolean} sticky Boolean indicating whether or not the thread is stickied
  * @apiSuccess {number} post_count The number of posts this thread contains
  * @apiSuccess {object} user Object containing info about user who created the thread
  * @apiSuccess {string} user.id The unique id of the user who created the thread
  * @apiSuccess {string} user.username The username of the user who created the thread
  * @apiSuccess {timestamp} created_at Timestamp of when the thread was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the thread was updated
  */
