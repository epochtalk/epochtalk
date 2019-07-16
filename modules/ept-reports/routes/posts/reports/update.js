var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {PUT} /reports/posts (Admin) Update Post Report
  * @apiName UpdatePostReport
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to update the status of a post moderation report.
  *
  * @apiParam (Payload) {string} id The id of the post report note
  * @apiParam (Payload) {string="Pending","Reviewed","Ignored","Bad Report"} status The updated note status
  * @apiParam (Payload) {string} reviewer_user_id The id of the user updating the post report
  *
  * @apiSuccess {string} id The unique id of the post report which was updated
  * @apiSuccess {string} status The status of the report
  * @apiSuccess {string} reporter_user_id The unique id of the user initiating the report
  * @apiSuccess {string} reporter_reason The reporter's reason for reporting the offending post
  * @apiSuccess {string} reviewer_user_id The unique id of the user reviewing the report
  * @apiSuccess {string} offender_post_id The unique id of the post being reported
  * @apiSuccess {timestamp} created_at Timestamp of when the post report was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the post report was updated
  *
  * @apiError (Error 500) InternalServerError There was an error updating the post report
  */
module.exports = {
  method: 'PUT',
  path: '/api/reports/posts',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'reports.updatePostReport',
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
    pre: [ { method: (request) => request.server.methods.auth.reports.posts.reports.update(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var report = Object.assign({}, request.payload);
    var promise = request.db.reports.updatePostReport(report)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
