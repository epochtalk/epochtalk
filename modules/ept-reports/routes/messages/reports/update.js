var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {PUT} /reports/messages (Admin) Update Message Report
  * @apiName UpdateMessageReport
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to update the status of a message moderation report.
  *
  * @apiParam (Payload) {string} id The id of the message report
  * @apiParam (Payload) {string="Pending","Reviewed","Ignored","Bad Report"} status The updated note status
  * @apiParam (Payload) {string} reviewer_user_id The id of the user updating the message report
  *
  * @apiSuccess {string} id The unique id of the message report which was created
  * @apiSuccess {string} status The status of the report
  * @apiSuccess {string} reporter_user_id The unique id of the user initiating the report
  * @apiSuccess {string} reporter_reason The reporter's reason for reporting the offending message
  * @apiSuccess {string} reviewer_user_id The unique id of the user reviewing the report
  * @apiSuccess {string} offender_message_id The unique id of the message being reported
  * @apiSuccess {timestamp} created_at Timestamp of when the message report was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the message report was updated
  *
  * @apiError (Error 500) InternalServerError There was an error updating the message report
  */
module.exports = {
  method: 'PUT',
  path: '/api/reports/messages',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'reports.updateMessageReport',
        data: {
          id: 'payload.id',
          status: 'payload.status'
        }
      }
    },
    validate: {
      payload: {
        id: Joi.string().required(),
        status: Joi.string().valid('Pending', 'Reviewed', 'Ignored', 'Bad Report').required(),
        reviewer_user_id: Joi.string().required()
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.reports.messages.reports.update(request.server, request.auth) } ]
  },
  handler: function(request) {
    var report = Object.assign({}, request.payload);
    var promise = request.db.reports.updateMessageReport(report)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
