var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {POST} /reports/usernotes (Admin) Create User Report Note
  * @apiName CreateUserReportNote
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to leave a note on user moderation reports.
  *
  * @apiParam (Payload) {string} report_id The id of the user report to leave the note on
  * @apiParam (Payload) {string} user_id The id of the user leaving the user report note
  * @apiParam (Payload) {string} note The note being left on the user report
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
  * @apiError (Error 500) InternalServerError There was an error creating the user report note
  */
module.exports = {
  method: 'POST',
  path: '/api/reports/usernotes',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'reports.createUserReportNote',
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
    pre: [ { method: 'auth.reports.users.notes.create(server, auth)' } ]
  },
  handler: function(request, reply) {
    var reportNote = Object.assign({}, request.payload);
    var promise = request.db.reports.createUserReportNote(reportNote)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
