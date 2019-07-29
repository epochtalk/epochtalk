var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {PUT} /reports/usernotes (Admin) Update User Report Note
  * @apiName UpdateUserReportNote
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to update an existing note on user moderation reports.
  *
  * @apiParam (Payload) {string} id The id of the user report note
  * @apiParam (Payload) {string} note The updated note
  *
  * @apiSuccess {string} id  The unique id for the user report note
  * @apiSuccess {string} report_id The id of the user report to leave the note on
  * @apiSuccess {string} user_id The id of the user leaving the user report note
  * @apiSuccess {string} username The username of the user who left the user report note
  * @apiSuccess {string} avatar The url to the avatar of the user who left the user report note
  * @apiSuccess {string} note The note being left on the user report
  * @apiSuccess {timestamp} created_at Timestamp of when the user report note was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the user report note was last updated
  *
  * @apiError (Error 400) BadRequest Note must not be empty
  * @apiError (Error 500) InternalServerError There was an error updating the user report note
  */
module.exports = {
  method: 'PUT',
  path: '/api/reports/usernotes',
  options: {
    app: { auth: { type: 'user'} },
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'reports.updateUserReportNote',
        data: {
          id: 'payload.id',
          report_id: 'payload.report_id',
          note: 'payload.note'
        }
      }
    },
    validate: {
      payload: {
        id: Joi.string().required(),
        report_id: Joi.string().required(),
        note: Joi.string().max(255)
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.reports.users.notes.update(request.server, request.auth, request.payload.id) } ],
  },
  handler: function(request, reply) {
    var reportNote = Object.assign({}, request.payload);
    var promise = request.db.reports.updateUserReportNote(reportNote)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
