var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {PUT} /reports/users (Admin) Update User Report
  * @apiName UpdateUserReport
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to update the status of a user moderation report.
  *
  * @apiParam (Payload) {string} id The id of the user report
  * @apiParam (Payload) {string="Pending","Reviewed","Ignored","Bad Report"} status The updated note status
  * @apiParam (Payload) {string} reviewer_user_id The id of the user updating the user report
  *
  * @apiSuccess {string} id The unique id of the user report which was created
  * @apiSuccess {string} status The status of the report
  * @apiSuccess {string} reporter_user_id The unique id of the user initiating the report
  * @apiSuccess {string} reporter_reason The reporter's reason for reporting the offending user
  * @apiSuccess {string} reviewer_user_id The unique id of the user reviewing the report
  * @apiSuccess {string} offender_user_id The unique id of the user being reported
  * @apiSuccess {timestamp} created_at Timestamp of when the user report was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the user report was updated
  *
  * @apiError (Error 500) InternalServerError There was an error updating the user report
  */
module.exports = {
  method: 'PUT',
  path: '/api/reports/users',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'reports.updateUserReport',
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
    pre: [ { method: (request) => request.server.methods.auth.reports.users.reports.update(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var report = Object.assign({}, request.payload);
    var promise = request.db.reports.updateUserReport(report)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
