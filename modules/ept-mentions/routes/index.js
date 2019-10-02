var Joi = require('@hapi/joi');
var path = require('path');

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
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { query: { id: Joi.string() } },
    pre: [{ method: (request) => request.server.methods.auth.mentions.delete(request.server, request.auth) }],
  },
  handler: function(request) {
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
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      query: {
        limit: Joi.number(),
        page: Joi.number()
      }
    }
  },
  handler: function(request) {
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
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { payload: { username: Joi.string().required() } }
  },
  handler: function(request) {
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
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { payload: { username: Joi.string() } }
  },
  handler: function(request) {
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


/**
  * @apiVersion 0.4.0
  * @apiGroup Mentions
  * @api {GET} /mentions/settings Get Mention Settings
  * @apiName GetMentionSettings
  * @apiPermission User
  * @apiDescription Used to retreive the user's mention settings
  *
  * @apiSuccess {boolean} email_mentions Boolean indicating if the user is receiving emails when mentioned
  *
  * @apiError (Error 500) InternalServerError There was an getting mention settings
  */
var getMentionEmailSettings = {
  method: 'GET',
  path: '/api/mentions/settings',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true }
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;

    var promise = request.db.mentions.getMentionEmailSettings(userId)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};

module.exports = [
  page: require(path.join(__dirname, 'page')),
  remove,
  pageIgnoredUsers,
  ignoreUser,
  unignoreUser,
  getMentionEmailSettings,
  enableMentionEmails: require(path.join(__dirname, 'enableMentionEmails'))
];
