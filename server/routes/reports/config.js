var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var db = require(path.normalize(__dirname + '/../../../db'));

/**
  * @apiVersion 0.3.0
  * @apiGroup Reports
  * @api {POST} /reports/users Create User Report
  * @apiName CreateUserReport
  * @apiPermission Users
  * @apiDescription Used to report a user for moderators/administrators to review.
  *
  * @apiParam (Payload) {string} reporter_user_id The unique id of the user initiating the report
  * @apiParam (Payload) {string} reporter_reason The reporter's reason for reporting the offending user
  * @apiParam (Payload) {string} offender_user_id The unique id of the user being reported
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
  * @apiError (Error 500) InternalServerError There was an issue creating the user report
  */
exports.createUserReport = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'reports.createUserReport' },
  validate: {
    payload: {
      reporter_user_id: Joi.string().required(),
      reporter_reason: Joi.string().required(),
      offender_user_id: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var report = request.payload;
    var promise = db.reports.createUserReport(report);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Reports
  * @api {POST} /reports/users Create Post Report
  * @apiName CreatePostReport
  * @apiPermission Users
  * @apiDescription Used to report a post for moderators/administrators to review.
  *
  * @apiParam (Payload) {string} reporter_user_id The unique id of the user initiating the report
  * @apiParam (Payload) {string} reporter_reason The reporter's reason for reporting the offending post
  * @apiParam (Payload) {string} offender_post_id The unique id of the post being reported
  *
  * @apiSuccess {string} id The unique id of the post report which was created
  * @apiSuccess {string} status The status of the report
  * @apiSuccess {string} reporter_user_id The unique id of the user initiating the report
  * @apiSuccess {string} reporter_reason The reporter's reason for reporting the offending post
  * @apiSuccess {string} reviewer_user_id The unique id of the user reviewing the report
  * @apiSuccess {string} offender_post_id The unique id of the post being reported
  * @apiSuccess {timestamp} created_at Timestamp of when the post report was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the post report was updated
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the post report
  */
exports.createPostReport = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'reports.createPostReport' },
  validate: {
    payload: {
      reporter_user_id: Joi.string().required(),
      reporter_reason: Joi.string().required(),
      offender_post_id: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var report = request.payload;
    var promise = db.reports.createPostReport(report);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Reports
  * @api {POST} /reports/messages Create Message Report
  * @apiName CreateMessageReport
  * @apiPermission Users
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
  * @apiError (Error 500) InternalServerError There was an issue creating the private message report
  */
exports.createMessageReport = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'reports.createMessageReport' },
  validate: {
    payload: {
      reporter_user_id: Joi.string().required(),
      reporter_reason: Joi.string().required(),
      offender_message_id: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var report = request.payload;
    var promise = db.reports.createMessageReport(report);
    return reply(promise);
  }
};
