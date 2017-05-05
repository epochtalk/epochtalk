var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {GET} /reports/users (Admin) Page User Report
  * @apiName PageUserReport
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to page through user moderation reports.
  *
  * @apiParam (Query) {number} [page=1] The page of user reports to retrieve
  * @apiParam (Query) {number} [limit=15] The number of user reports to retrieve per page
  * @apiParam (Query) {string="Pending","Reviwed","Ignored","Bad Report"} [filter] Used to filter reports by their status
  * @apiParam (Query) {string="created_at","priority","reporter_username","offender_username","offender_email","offender_created_at"} [field=created_at] Indicates which column to sort by, used for table sorting
  * @apiParam (Query) {boolean} [desc=false] Boolean indicating whether or not to sort the results in descending order
  * @apiParam (Query) {string} [search] String used to search for a report by username
  *
  * @apiSuccess {number} count The total number of reports
  * @apiSuccess {number} limit The number of reports to bring back per page
  * @apiSuccess {number} page The current page of reports brought back
  * @apiSuccess {number} page_count The total number of pages
  * @apiSuccess {string} filter Indicates the status type of the report being brought back
  * @apiSuccess {string} field Indicates the field the reports are sorted by
  * @apiSuccess {string} search Indicates the search string
  * @apiSuccess {boolean} desc Boolean indicating if the results are in descending order
  * @apiSuccess {object[]} data An array of user reports. Sort order varies depending on the query parameters passed in.
  * @apiSuccess {string} data.id The unique id of the user report
  * @apiSuccess {string} data.status The status of the user report
  * @apiSuccess {string} data.reviewer_user_id The unique id of the user who reviewed the user report
  * @apiSuccess {timestamp} data.offender_ban_expiration If the user is banned, the expiration of their ban
  * @apiSuccess {boolean} data.offender_board_banned Boolean indicating if user is board banned
  * @apiSuccess {timestamp} data.offender_created_at When the offending user created their account
  * @apiSuccess {string} data.offender_email The email of the offending user
  * @apiSuccess {string} data.offender_user_id The unique id of the offending user
  * @apiSuccess {string} data.offender_username The username of the offending user
  * @apiSuccess {string} data.reporter_reason The reason for the report
  * @apiSuccess {string} data.reporter_user_id The unique id of the reporting user
  * @apiSuccess {string} data.reporter_username The username of the reporting user
  * @apiSuccess {timestamp} data.created_at Timestamp of when the user report was created
  * @apiSuccess {timestamp} data.updated_at Timestamp of when the user report was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error retrieving the user reports
  */
module.exports = {
  method: 'GET',
  path: '/api/reports/users',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(15),
        filter: Joi.string().valid('Pending', 'Reviewed', 'Ignored', 'Bad Report'),
        field: Joi.string().default('created_at').valid('created_at', 'priority', 'reporter_username', 'offender_username', 'offender_email', 'offender_created_at'),
        desc: Joi.boolean().default(false),
        search: Joi.string()
      }
    },
    pre: [ { method: 'auth.reports.users.reports.page(server, auth)' } ]
  },
  handler: function(request, reply) {
    var opts = {
      page: request.query.page,
      limit: request.query.limit,
      filter: request.query.filter,
      sortField: request.query.field,
      sortDesc: request.query.desc,
      searchStr: request.query.search
    };

    var userReports = request.db.reports.pageUserReports(opts);
    var userReportsCount = request.db.reports.userReportsCount(opts);

    var promise = Promise.join(userReports, userReportsCount, function(reports, count) {
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
