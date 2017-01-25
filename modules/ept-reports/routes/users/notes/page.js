var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {GET} /admin/reports/usernotes/:userReportId (Admin) Page User Report Notes
  * @apiName PageUserReportNotes
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to page through user moderation report notes.
  *
  * @apiParam {string} userReportId The unique id of the user report to retrieve notes for
  *
  * @apiParam (Query) {number} page=1 The page of user report notes to retrieve
  * @apiParam (Query) {number} limit=10 The number of user report notes to retrieve per page
  * @apiParam (Query) {boolean} desc=true Boolean indicating whether or not to sort the results in descending order
  *
  * @apiSuccess {object} userReportNotes An object containing user report notes and page data
  * @apiSuccess {number} userReportNotes.count The total number of report notes
  * @apiSuccess {number} userReportNotes.limit The number of report notes to bring back per page
  * @apiSuccess {number} userReportNotes.page The current page of report notes brought back
  * @apiSuccess {number} userReportNotes.page_count The total number of pages
  * @apiSuccess {boolean} userReportNotes.desc Boolean indicating if the results are in descending order
  * @apiSuccess {object[]} userReportNotes.data An array of user report note objects.
  * @apiSuccess {string} userReportNotes.data.id The unique id of the user report note
  * @apiSuccess {string} userReportNotes.data.report_id The unique id of the user report this note is for
  * @apiSuccess {string} userReportNotes.data.user_id The unique id of the user who left the note
  * @apiSuccess {string} userReportNotes.data.avatar The URL to the avatar of the user who left the note
  * @apiSuccess {string} userReportNotes.data.note The note message that was left on the report
  * @apiSuccess {timestamp} userReportNotes.data.created_at Timestamp of when the report note was created
  * @apiSuccess {timestamp} userReportNotes.data.updated_at Timestamp of when the report note was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error retrieving the user report notes
  */
module.exports = {
  method: 'GET',
  path: '/api/reports/usernotes/{report_id}',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      params: { report_id: Joi.string().required() },
      query: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        desc: Joi.boolean().default(true)
      }
    },
    pre: [ { method: 'auth.reports.users.notes.page(server, auth)' } ]
  },
  handler: function(request, reply) {
    var reportId = request.params.report_id;
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      sortDesc: request.query.desc
    };

    var reportNotes = request.db.reports.pageUserReportsNotes(reportId, opts);
    var reportNotesCount = request.db.reports.userReportsNotesCount(reportId);

    var promise = Promise.join(reportNotes, reportNotesCount, function(notes, count) {
      return {
        data: notes,
        count: count,
        limit: opts.limit,
        page: opts.page,
        page_count: Math.ceil(count / opts.limit),
        desc: opts.desc
      };
    });

    return reply(promise);
  }
};
