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
module.exports = {
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
