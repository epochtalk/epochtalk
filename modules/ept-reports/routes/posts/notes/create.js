var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {POST} /reports/postnotes (Admin) Create Post Report Note
  * @apiName CreatePostReportNote
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to leave a note on post moderation reports.
  *
  * @apiParam (Payload) {string} report_id The id of the post report to leave the note on
  * @apiParam (Payload) {string} user_id The id of the post leaving the post report note
  * @apiParam (Payload) {string} note The note being left on the post report
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
  * @apiError (Error 500) InternalServerError There was an error creating the post report note
  */
module.exports = {
  method: 'POST',
  path: '/api/reports/postnotes',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'reports.createPostReportNote',
        data: {
          report_id: 'payload.report_id',
          note: 'payload.note'
        }
      }
    },
    validate: {
      payload: {
        report_id: Joi.string().required(),
        user_id: Joi.string().required(),
        note: Joi.string().max(255).required()
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.reports.posts.notes.create(request.server, request.auth) } ]
  },
  handler: function(request) {
    var reportNote = Object.assign({}, request.payload);
    var promise = request.db.reports.createPostReportNote(reportNote)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
