var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {PUT} /reports/messagenotes (Admin) Update Message Report Note
  * @apiName UpdateMessageReportNote
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to update an existing note on message moderation reports.
  *
  * @apiParam (Payload) {string} id The id of the message report note
  * @apiParam (Payload) {string} note The updated note
  *
  * @apiSuccess {string} id  The unique id for the message report note
  * @apiSuccess {string} report_id The id of the message report to leave the note on
  * @apiSuccess {string} user_id The id of the user leaving the message report note
  * @apiSuccess {string} username The username of the user who left the message report note
  * @apiSuccess {string} avatar The url to the avatar of the user who left the message report note
  * @apiSuccess {string} note The note being left on the message report
  * @apiSuccess {timestamp} created_at Timestamp of when the message report note was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the message report note was last updated
  *
  * @apiError (Error 400) BadRequest Note must not be empty
  * @apiError (Error 500) InternalServerError There was an error updating the message report note
  */
module.exports = {
  method: 'PUT',
  path: '/api/reports/messagenotes',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'reports.updateMessageReportNote',
        data: {
          id: 'payload.id',
          report_id: 'payload.report_id',
          note: 'payload.note'
        }
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.reports.messages.notes.update(request.server, request.auth, request.payload.id) } ],
    validate: {
      payload: {
        id: Joi.string().required(),
        report_id: Joi.string().required(),
        note: Joi.string().max(255)
      }
    }
  },
  handler: function(request) {
    var reportNote = Object.assign({}, request.payload);
    var promise = request.db.reports.updateMessageReportNote(reportNote)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
