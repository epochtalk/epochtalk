var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Moderation
  * @api {GET} /admin/modlog (Admin) Page Moderation Log
  * @apiName PageModLogAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription This allows Administrators to page through all actions performed by moderators.
  *
  * @apiParam (Query) {number{1..n}} [page=1] The page of moderation logs to retrieve
  * @apiParam (Query) {number{1..n}} [limit=25] The number of logs to retrieve per page
  * @apiParam (Query) {string} [mod] The username of the moderator to search logs for
  * @apiParam (Query) {action} [action] The action to search for, follows route permission conventions (e.g. posts.create, posts.update, etc...)
  * @apiParam (Query) {string} [keyword] Keywords to search log for
  * @apiParam (Query) {timestamp} [bdate] Used to search for logs before specific date
  * @apiParam (Query) {timestamp} [adate] Used to search for logs after specific date
  * @apiParam (Query) {timestamp} [sdate] Used to search for logs between specific date (start)
  * @apiParam (Query) {timestamp} [edate] Used to search for logs between specific date (end)
  *
  * @apiSuccess {number} page The current page of moderation logs being returned
  * @apiSuccess {number} limit The number of logs being returned per page
  * @apiSuccess {number} next The page number of the next page
  * @apiSuccess {number} prev The page number of the previous page
  * @apiSuccess {object[]} data Array containing moderation logs
  * @apiSuccess {string} mod_username The username of the mod who performed the action
  * @apiSuccess {string} mod_id The id of the mod who performed the action
  * @apiSuccess {string} mod_ip The ip address of the mod who performed the action
  * @apiSuccess {string} action_api_url The route that the moderator used to perform action
  * @apiSuccess {string} action_api_method The route method type (e.g. PUT, GET, etc..)
  * @apiSuccess {object} action_api_obj Metadata which was saved to the log when the action was performed
  * @apiSuccess {timestamp} action_taken_at Timestamp of when the action was performed
  * @apiSuccess {string} action_type The type of action that was performed, follows route permission conventions (e.g. posts.create, posts.update, etc...)
  * @apiSuccess {string} action_display_text Text describing what action was taken
  * @apiSuccess {string} action_display_text Link to view where action was taken
  *
  * @apiError (Error 500) InternalServerError There was an error retrieving the moderation logs
  */
module.exports = {
  method: 'GET',
  path: '/api/admin/modlog',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(25),
        mod: Joi.string(),
        action: Joi.string(),
        keyword: Joi.string(),
        bdate: Joi.date(),
        adate: Joi.date(),
        sdate: Joi.date(),
        edate: Joi.date()
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.moderationLogs.page(request.server, request.auth) } ],
  },
  handler: function(request, reply) {
    var promise = request.db.moderationLogs.page(request.query)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
