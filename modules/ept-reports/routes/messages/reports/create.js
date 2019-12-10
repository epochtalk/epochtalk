var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {POST} /reports/messages Create Message Report
  * @apiName CreateMessageReport
  * @apiPermission User
  * @apiDescription Used to report a private message for moderators/administrators to review.
  *
  * @apiParam (Payload) {string} reporter_user_id The unique id of the user initiating the report
  * @apiParam (Payload) {string} reporter_reason The reporter's reason for reporting the offending private message
  * @apiParam (Payload) {string} offender_message_id The unique id of the private message being reported
  *
  * @apiSuccess {string} id The unique id of the private message report which was created
  * @apiSuccess {string} status The status of the report
  * @apiSuccess {string} reporter_user_id The unique id of the user initiating the report
  * @apiSuccess {string} reporter_reason The reporter's reason for reporting the offending message
  * @apiSuccess {string} reviewer_user_id The unique id of the user reviewing the report
  * @apiSuccess {string} offender_message_id The unique id of the private message being reported
  * @apiSuccess {timestamp} created_at Timestamp of when the private message report was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the private message report was updated
  *
  * @apiError (Error 500) InternalServerError There was an issue reporting the message report
  */
module.exports = {
  method: 'POST',
  path: '/api/reports/messages',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: Joi.object({
        reporter_user_id: Joi.string().required(),
        reporter_reason: Joi.string().max(255).required(),
        offender_message_id: Joi.string().required()
      })
    },
    pre: [ { method: (request) => request.server.methods.auth.reports.messages.reports.create(request.server, request.auth) } ]
  },
  handler: function(request) {
    var report = request.payload;
    var promise = request.db.reports.createMessageReport(report)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
