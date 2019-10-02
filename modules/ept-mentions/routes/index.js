var Joi = require('@hapi/joi');
var path = require('path');

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
  remove: require(path.join(__dirname, 'remove')),
  pageIgnoredUsers: require(path.join(__dirname, 'pageIgnoredUsers')),
  ignoreUser: require(path.join(__dirname, 'ignoreUser')),
  unignoreUser,
  getMentionEmailSettings,
  enableMentionEmails: require(path.join(__dirname, 'enableMentionEmails'))
];
