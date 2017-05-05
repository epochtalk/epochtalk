var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {POST} /reports/messagenotes (Admin) Create Message Report Note
  * @apiName CreateMessageReportNote
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to leave a note on message moderation reports.
  *
  * @apiParam (Payload) {string} report_id The id of the message report to leave the note on
  * @apiParam (Payload) {string} user_id The id of the message leaving the message report note
  * @apiParam (Payload) {string} note The note being left on the message report
  *
  * @apiSuccess {string} id The unique id for the message report note
  * @apiSuccess {string} report_id The id of the message report to leave the note on
  * @apiSuccess {string} user_id The id of the user leaving the message report note
  * @apiSuccess {string} username The username of the user who left the message report note
  * @apiSuccess {string} avatar The url to the avatar of the user who left the message report note
  * @apiSuccess {string} note The note being left on the message report
  * @apiSuccess {timestamp} created_at Timestamp of when the message report note was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the message report note was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error creating the message report note
  */
module.exports = {
  method: 'POST',
  path: '/api/reports/messagenotes',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'reports.createMessageReportNote',
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
    pre: [ { method: 'auth.reports.messages.notes.create(server, auth)' } ]
  },
  handler: function(request, reply) {
    var reportNote = Object.assign({}, request.payload);
    var promise = request.db.reports.createMessageReportNote(reportNote)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
