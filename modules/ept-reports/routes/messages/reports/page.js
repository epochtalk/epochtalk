var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {GET} /admin/reports/messages (Admin) Page Message Report
  * @apiName PageMessageReport
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to page through message moderation reports.
  *
  * @apiParam (Query) {number} page=1 The page of message reports to retrieve
  * @apiParam (Query) {number} limit=15 The number of message reports to retrieve per page
  * @apiParam (Query) {string="Pending","Reviwed","Ignored","Bad Report"} filter Used to filter reports by their status
  * @apiParam (Query) {string="created_at","priority","reporter_username","offender_created_at","offender_author_username"} field=created_at Indicates which column to sort by, used for table sorting
  * @apiParam (Query) {boolean} desc=false Boolean indicating whether or not to sort the results in descending order
  * @apiParam (Query) {string} [search] String used to search for a report by username
  *
  * @apiSuccess {object} messageReports An object containing message reports and page data
  * @apiSuccess {number} messageReports.count The total number of reports
  * @apiSuccess {number} messageReports.limit The number of reports to bring back per page
  * @apiSuccess {number} messageReports.page The current page of reports brought back
  * @apiSuccess {number} messageReports.page_count The total number of pages
  * @apiSuccess {string} messageReports.filter Indicates the status type of the report being brought back
  * @apiSuccess {string} messageReports.field Indicates the field the reports are sorted by
  * @apiSuccess {string} messageReports.search Indicates the search string
  * @apiSuccess {boolean} messageReports.desc Boolean indicating if the results are in descending order
  * @apiSuccess {object[]} messageReports.data An array of message reports. Sort order varies depending on the query parameters passed in.
  * @apiSuccess {string} messageReports.data.id The unique id of the message report
  * @apiSuccess {string} messageReports.data.status The status of the message report
  * @apiSuccess {string} messageReports.data.reviewer_user_id The unique id of the user who reviewed the message report
  * @apiSuccess {timestamp} messageReports.data.offender_ban_expiration If the user is banned, the expiration of their ban
  * @apiSuccess {string} messageReports.data.offender_message_id The unique id of the offending message
  * @apiSuccess {string} messageReports.data.offender_message The body of the offending message
  * @apiSuccess {timestamp} messageReports.data.offender_created_at Timestamp of the offending message was created
  * @apiSuccess {timestamp} messageReports.data.offender_author_created_at Timestamp of the offending message's author created date
  * @apiSuccess {string} messageReports.data.offender_author_username The username of the offending message's author
  * @apiSuccess {string} messageReports.data.offender_author_email The email of the user who created the offending message
  * @apiSuccess {string} messageReports.data.offender_author_id The unique id of the offending message's author
  * @apiSuccess {string} messageReports.data.reporter_reason The reason for the report
  * @apiSuccess {string} messageReports.data.reporter_user_id The unique id of the reporting user
  * @apiSuccess {string} messageReports.data.reporter_username The username of the reporting user
  * @apiSuccess {timestamp} messageReports.data.created_at Timestamp of when the message report was created
  * @apiSuccess {timestamp} messageReports.data.updated_at Timestamp of when the message report was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error retrieving the message reports
  */
module.exports = {
  method: 'GET',
  path: '/api/reports/messages',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(15),
        filter: Joi.string().valid('Pending', 'Reviewed', 'Ignored', 'Bad Report'),
        field: Joi.string().default('created_at').valid('created_at', 'priority', 'reporter_username', 'offender_created_at', 'offender_author_username'),
        desc: Joi.boolean().default(false),
        search: Joi.string()
      }
    },
    pre: [ { method: 'auth.reports.messages.reports.page(server, auth)' } ]
  },
  handler: function(request, reply) {
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      filter: request.query.filter,
      sortField: request.query.field,
      sortDesc: request.query.desc,
      searchStr: request.query.search
    };
    var messageReports = request.db.reports.pageMessageReports(opts);
    var messageReportsCount = request.db.reports.messageReportsCount(opts);

    var promise = Promise.join(messageReports, messageReportsCount, function(reports, count) {
      return {
        data: reports,
        count: count,
        limit: opts.limit,
        page: opts.page,
        page_count: Math.ceil(count / opts.limit),
        filter: opts.filter,
        field: opts.sortField,
        desc: opts.sortDesc,
        search: opts.searchStr
      };
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
