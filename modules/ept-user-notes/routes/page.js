var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /user/notes (Admin) Page User Notes
  * @apiName PageUserNotesAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to page through user notes
  *
  * @apiParam (Query) {number{1..n}} [page=1] The page of results to return
  * @apiParam (Query) {number{1..100}} [limit=25] The number of results per page to return
  * @apiParam (Query) {string} user_id The id of the user whose notes to page through
  *
  * @apiSuccess {string} user_id The id of the user whose notes are being returned
  * @apiSuccess {number} page The current page of results that is being returned
  * @apiSuccess {number} limit The current number of results that is being returned per page
  * @apiSuccess {boolean} next boolean indicating if there is a next page
  * @apiSuccess {boolean} prev boolean indicating if there is a previous page
  * @apiSuccess {object[]} data An array of user notes
  * @apiSuccess {string} data.id The id of the user note
  * @apiSuccess {string} data.author_id The id of the admin or mod who left the note
  * @apiSuccess {string} data.author_name The username of the admin or mod who left the note
  * @apiSuccess {string} data.author_avatar The avatar of the admin or mod who left the note
  * @apiSuccess {string} data.author_highlight_color The highlight color of the admin or mod who left the note
  * @apiSuccess {string} data.note The note left by the admin or mod
  * @apiSuccess {timestamp} data.created_at The created at timestamp of the note
  * @apiSuccess {timestamp} data.updated_at The updated at timestamp of the note
  *
  * @apiError (Error 500) InternalServerError There was an error paging user notes
  * @apiError (Error 403) Forbidden User doesn't have permission to query user notes
  */
module.exports = {
  method: 'GET',
  path: '/api/user/notes',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'userNotes.page' },
    validate: {
      query: {
        user_id: Joi.string().required(),
        page: Joi.number().min(1).default(1),
        limit: Joi.number().min(1).max(100).default(25)
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.userNotes.page(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var opts = request.query;
    var promise = request.db.userNotes.page(opts)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
