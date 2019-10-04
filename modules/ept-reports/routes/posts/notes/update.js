var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {PUT} /reports/usernotes (Admin) Update Post Report Note
  * @apiName UpdatePostReportNote
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to update an existing note on post moderation reports.
  *
  * @apiParam (Payload) {string} id The id of the post report note
  * @apiParam (Payload) {string} note The updated note
  *
  * @apiSuccess {string} id  The unique id for the post report note
  * @apiSuccess {string} report_id The id of the post report to leave the note on
  * @apiSuccess {string} user_id The id of the user leaving the post report note
  * @apiSuccess {string} username The username of the user who left the post report note
  * @apiSuccess {string} avatar The url to the avatar of the user who left the post report note
  * @apiSuccess {string} note The note being left on the post report
  * @apiSuccess {timestamp} created_at Timestamp of when the post report note was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the post report note was last updated
  *
  * @apiError (Error 400) BadRequest Note must not be empty
  * @apiError (Error 500) InternalServerError There was an error updating the post report note
  */
module.exports = {
  method: 'PUT',
  path: '/api/reports/postnotes',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'reports.updatePostReportNote',
        data: {
          id: 'payload.id',
          report_id: 'payload.report_id',
          note: 'payload.note'
        }
      }
    },
    validate: {
      payload: Joi.object({
        id: Joi.string().required(),
        report_id: Joi.string().required(),
        note: Joi.string().max(255)
      })
    },
    pre: [ { method: (request) => request.server.methods.auth.reports.posts.notes.update(request.server, request.auth, request.payload.id) } ],
  },
  handler: function(request) {
    var reportNote = Object.assign({}, request.payload);
    var promise = request.db.reports.updatePostReportNote(reportNote)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
