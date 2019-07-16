var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Mentions
  * @api {GET} /mentions View Mentions
  * @apiName GetMentions
  * @apiPermission User
  * @apiDescription Used to view a user's mentions
  *
  * @apiParam (Query) {number} [page] The page of mentions to return
  * @apiParam (Query) {number} [limit] The number mentions to return per page
  * @apiParam (Query) {boolean} [extended] Brings back extra data such as parts of the post body, board name, board id, etc...
  *
  * @apiSuccess {number} page The page of mentions being returned
  * @apiSuccess {number} limit The number mentions being returned per page
  * @apiSuccess {boolean} prev Boolean indicating if there is a previous page
  * @apiSuccess {boolean} next Boolean indicating if there is a next page
  * @apiSuccess {boolean} extended Boolean indicating if extra metadata should be returned
  * @apiSuccess {object[]} data Array containing mention objects
  * @apiSuccess {string} data.id The id of the mention
  * @apiSuccess {string} data.thread_id The id of the thread the mention is in
  * @apiSuccess {string} data.title The title of the thread the mention is in
  * @apiSuccess {string} data.post_id The id of the post the mention is in
  * @apiSuccess {number} data.post_start The start position of the post in the thread
  * @apiSuccess {string} data.mentioner The username of the mentioner
  * @apiSuccess {string} data.mentioner_avatar The avatar of the mentioner
  * @apiSuccess {string} data.notification_id The id of the notification (for websockets)
  * @apiSuccess {boolean} data.viewed Boolean indicating if the mention has been viewed
  * @apiSuccess {timestamp} data.created_at Timestamp of when the mention was created
  * @apiSuccess {string} data.board_id The id of the board the mention is in (If extended=true)
  * @apiSuccess {string} data.board_name The name of the board the mentions is in(If extended=true)
  * @apiSuccess {string} data.body_html The body of the post the mention is in (If extended=true)
  * @apiSuccess {string} data.body The unprocess body of the post the mention is in (If extended=true)
  *
  * @apiError (Error 500) InternalServerError There was an error paging user mentions
  */
var page = {
  method: 'GET',
  path: '/api/mentions',
  config: {
    app: { hook: 'mentions.page' },
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      query: {
        limit: Joi.number(),
        page: Joi.number(),
        extended: Joi.boolean()
      }
    },
    pre: [
      { method: (request) => request.server.methods.auth.mentions.page(request.server, request.auth) },
      { method: (request) => request.server.methods.hooks.preProcessing },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing, assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: (request) => request.server.methods.hooks.merge },
      { method: (request) => request.server.methods.common.posts.parseOut(request.parser, request.pre.processed.data) },
      { method: (request) => request.server.methods.hooks.postProcessing }
    ]
  },
  handler: function(request, reply) {
    return reply(request.pre.processed);
  }
};

function processing(request, reply) {
  var mentioneeId = request.auth.credentials.id;
  var opts = {
    limit: request.query.limit,
    page: request.query.page,
    extended: request.query.extended
  };
  var promise = request.db.mentions.page(mentioneeId, opts)
  .error(request.errorMap.toHttpError);

  return promise;
}

/**
  * @apiVersion 0.4.0
  * @apiGroup Mentions
  * @api {DELETE} /mentions Delete Mentions
  * @apiName DeleteMentions
  * @apiPermission User
  * @apiDescription Used to delete a user's mentions
  *
  * @apiParam (Query) {string} id The id of the mention to delete
  *
  * @apiSuccess {boolean} deleted True if the mention was deleted
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting the mention
  */
var remove = {
  method: 'DELETE',
  path: '/api/mentions',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { query: { id: Joi.string() } },
    pre: [{ method: (request) => request.server.methods.auth.mentions.delete(request.server, request.auth) }],
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var mentionId = request.query.id;
    var promise = request.db.mentions.remove(mentionId, userId)
    .tap(function() {
      var notification = {
        channel: { type: 'user', id: userId },
        data: { action: 'refreshMentions' }
      };
      request.server.plugins.notifications.systemNotification(notification);
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};



/**
  * @apiVersion 0.4.0
  * @apiGroup Mentions
  * @api {GET} /mentions/ignored Page Ignored Users
  * @apiName PageIgnoredUserMentions
  * @apiPermission User
  * @apiDescription Used to page through user's whos mentions are being ignored
  *
  * @apiParam (Query) {number} [page] The page of ignored users to return
  * @apiParam (Query) {number} [limit] The number ignored users to return per page
  *
  * @apiSuccess {number} page The page of ignored users being returned
  * @apiSuccess {number} limit The number ignored users being returned per page
  * @apiSuccess {boolean} prev Boolean indicating if there is a previous page
  * @apiSuccess {boolean} next Boolean indicating if there is a next page
  * @apiSuccess {object[]} data Array containing ignored users
  * @apiSuccess {string} data.username The name of the user being ignored
  * @apiSuccess {string} data.id The id of the user being ignored
  * @apiSuccess {string} data.avatar The avatar of the user being ignored
  * @apiSuccess {boolean} data.ignored Boolean indicating if the user's mentions are being ignored
  *
  * @apiError (Error 500) InternalServerError There was an error paging ignored users
  */
var pageIgnoredUsers = {
  method: 'GET',
  path: '/api/mentions/ignored',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      query: {
        limit: Joi.number(),
        page: Joi.number()
      }
    }
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var opts = {
      limit: request.query.limit,
      page: request.query.page
    };
    var promise = request.db.mentions.pageIgnoredUsers(userId, opts)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Mentions
  * @api {POST} /mentions/ignore Ignore User's Mentions
  * @apiName IgnoreUsersMentions
  * @apiPermission User
  * @apiDescription Used to ignore mentions from a specific user's
  *
  * @apiParam (Payload) {string} username The name of the user to ignore mentions from
  *
  * @apiSuccess {boolean} success True if the user was ignored
  *
  * @apiError (Error 500) InternalServerError There was an issue ignoring mentions
  */
var ignoreUser = {
  method: 'POST',
  path: '/api/mentions/ignore',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { payload: { username: Joi.string().required() } }
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var ignoredUser = request.payload.username;
    var promise = request.db.users.userByUsername(ignoredUser)
    .then(function(user) {
      return request.db.mentions.ignoreUser(userId, user.id);
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Mentions
  * @api {POST} /mentions/unignore Unignore User's Mentions
  * @apiName UnignoreUsersMentions
  * @apiPermission User
  * @apiDescription Used to unignore mentions from a specific user's
  *
  * @apiParam (Payload) {string} username The name of the user to unignore mentions from
  *
  * @apiSuccess {boolean} success True if the user was unignored
  *
  * @apiError (Error 500) InternalServerError There was an issue unignoring mentions
  */
var unignoreUser = {
  method: 'POST',
  path: '/api/mentions/unignore',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { payload: { username: Joi.string() } }
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var ignoredUser = request.payload.username;
    var promise;
    if (ignoredUser) { // unignore one
      promise = request.db.users.userByUsername(ignoredUser)
      .then(function(user) {
        return request.db.mentions.unignoreUser(userId, user.id);
      })
      .error(request.errorMap.toHttpError);
    }
    else { // unignore all
      promise = request.db.mentions.unignoreUser(userId)
      .error(request.errorMap.toHttpError);
    }
    return promise;
  }
};

module.exports = [
  page,
  remove,
  pageIgnoredUsers,
  ignoreUser,
  unignoreUser
];
