var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {GET} /admin/reports/posts (Admin) Page Post Report
  * @apiName PagePostReport
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to page through post moderation reports.
  *
  * @apiParam (Query) {number} page=1 The page of post reports to retrieve
  * @apiParam (Query) {number} limit=15 The number of post reports to retrieve per page
  * @apiParam (Query) {string="Pending","Reviwed","Ignored","Bad Report"} filter Used to filter reports by their status
  * @apiParam (Query) {string="created_at","priority","reporter_username","offender_created_at","offender_title","offender_author_username"} field=created_at Indicates which column to sort by, used for table sorting
  * @apiParam (Query) {boolean} desc=false Boolean indicating whether or not to sort the results in descending order
  * @apiParam (Query) {string} [search] String used to search for a report by username
  * @apiParam (Query) {string} [mod_id] If moderators user id is passed in, only returns reports made in boards this user moderates
  *
  * @apiSuccess {object} postReports An object containing post reports and page data
  * @apiSuccess {number} postReports.count The total number of reports
  * @apiSuccess {number} postReports.limit The number of reports to bring back per page
  * @apiSuccess {number} postReports.page The current page of reports brought back
  * @apiSuccess {number} postReports.page_count The total number of pages
  * @apiSuccess {string} postReports.filter Indicates the status type of the report being brought back
  * @apiSuccess {string} postReports.field Indicates the field the reports are sorted by
  * @apiSuccess {string} postReports.search Indicates the search string
  * @apiSuccess {boolean} postReports.desc Boolean indicating if the results are in descending order
  * @apiSuccess {object[]} postReports.data An array of post reports. Sort order varies depending on the query parameters passed in.
  * @apiSuccess {string} postReports.data.id The unique id of the post report
  * @apiSuccess {string} postReports.data.status The status of the post report
  * @apiSuccess {string} postReports.data.reviewer_user_id The unique id of the user who reviewed the post report
  * @apiSuccess {timestamp} postReports.data.offender_ban_expiration If the user is banned, the expiration of their ban
  * @apiSuccess {string} postReports.data.offender_post_id The unique id of the offending post
  * @apiSuccess {string} postReports.data.offender_thread_id The unique id of the offending post's thread
  * @apiSuccess {string} postReports.data.offender_title The title of the offending post
  * @apiSuccess {timestamp} postReports.data.offender_created_at Timestamp of the offending post was created
  * @apiSuccess {timestamp} postReports.data.offender_author_created_at Timestamp of the offending post's author created date
  * @apiSuccess {string} postReports.data.offender_author_username The username of the offending post's author
  * @apiSuccess {string} postReports.data.offender_author_email The email of the user who created the offending post
  * @apiSuccess {string} postReports.data.offender_author_id The unique id of the offending post's author
  * @apiSuccess {string} postReports.data.reporter_reason The reason for the report
  * @apiSuccess {string} postReports.data.reporter_user_id The unique id of the reporting user
  * @apiSuccess {string} postReports.data.reporter_username The username of the reporting user
  * @apiSuccess {timestamp} postReports.data.created_at Timestamp of when the post report was created
  * @apiSuccess {timestamp} postReports.data.updated_at Timestamp of when the post report was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error retrieving the post reports
  */
module.exports = {
  method: 'GET',
  path: '/api/reports/posts',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(15),
        filter: Joi.string().valid('Pending', 'Reviewed', 'Ignored', 'Bad Report'),
        field: Joi.string().default('created_at').valid('created_at', 'priority', 'reporter_username', 'offender_created_at', 'offender_title', 'offender_author_username'),
        mod_id: Joi.string(),
        desc: Joi.boolean().default(false),
        search: Joi.string()
      }
    },
    pre: [ { method: 'auth.reports.posts.reports.page(server, auth)' } ]
  },
  handler: function(request, reply) {
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      filter: request.query.filter,
      sortField: request.query.field,
      sortDesc: request.query.desc,
      searchStr: request.query.search,
      modId: request.query.mod_id
    };

    // duplicating opts, if pagePostReports deslugifies modId,
    // it gets re-deslugified in postReportsCount, giving the wrong user id
    var countOpts = {
      filter: request.query.filter,
      searchStr: request.query.search,
      modId: request.query.mod_id
    };

    var postReports = request.db.reports.pagePostReports(opts);
    var postReportsCount = request.db.reports.postReportsCount(countOpts);

    var promise = Promise.join(postReports, postReportsCount, function(reports, count) {
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
    });

    return reply(promise);
  }
};
