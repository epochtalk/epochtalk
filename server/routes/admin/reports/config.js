var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');
var db = require(path.normalize(__dirname + '/../../../../db'));
var authorization = require(path.normalize(__dirname + '/../../../authorization'));

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {POST} /admin/reports/usernotes (Admin) Create User Report Note
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
exports.createUserReportNote = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.createUserReportNote' },
  validate: {
    payload: {
      report_id: Joi.string().required(),
      user_id: Joi.string().required(),
      note: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var reportNote = request.payload;
    db.reports.createUserReportNote(reportNote)
    .then(function(createdReportNote) { reply(createdReportNote); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {POST} /admin/reports/postnotes (Admin) Create Post Report Note
  * @apiName CreatePostReportNote
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to leave a note on post moderation reports.
  *
  * @apiParam (Payload) {string} report_id The id of the post report to leave the note on
  * @apiParam (Payload) {string} user_id The id of the post leaving the post report note
  * @apiParam (Payload) {string} note The note being left on the post report
  *
  * @apiSuccess {string} id  The unique id for the post report note
  * @apiSuccess {string} report_id The id of the post report to leave the note on
  * @apiSuccess {string} user_id The id of the user leaving the post report note
  * @apiSuccess {string} username The username of the user who left the post report note
  * @apiSuccess {string} avatar The url to the avatar of the user who left the post report note
  * @apiSuccess {string} note The note being left on the post report
  * @apiSuccess {timestamp} created_at Timestamp of when the post report note was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the post report note was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error creating the post report note
  */
exports.createPostReportNote = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.createPostReportNote' },
  validate: {
    payload: {
      report_id: Joi.string().required(),
      user_id: Joi.string().required(),
      note: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var reportNote = request.payload;
    db.reports.createPostReportNote(reportNote)
    .then(function(createdReportNote) { reply(createdReportNote); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {POST} /admin/reports/messagenotes (Admin) Create Message Report Note
  * @apiName CreateMessageReportNote
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to leave a note on message moderation reports.
  *
  * @apiParam (Payload) {string} report_id The id of the message report to leave the note on
  * @apiParam (Payload) {string} user_id The id of the message leaving the message report note
  * @apiParam (Payload) {string} note The note being left on the message report
  *
  * @apiSuccess {string} id The unique id for the message report note
  * @apiSuccess {string} report_id The id of the message report to leave the note on
  * @apiSuccess {string} user_id The id of the user leaving the message report note
  * @apiSuccess {string} username The username of the user who left the message report note
  * @apiSuccess {string} avatar The url to the avatar of the user who left the message report note
  * @apiSuccess {string} note The note being left on the message report
  * @apiSuccess {timestamp} created_at Timestamp of when the message report note was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the message report note was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error creating the message report note
  */
exports.createMessageReportNote = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.createMessageReportNote' },
  validate: {
    payload: {
      report_id: Joi.string().required(),
      user_id: Joi.string().required(),
      note: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var reportNote = request.payload;
    db.reports.createMessageReportNote(reportNote)
    .then(function(createdReportNote) { reply(createdReportNote); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {PUT} /admin/reports/users (Admin) Update User Report
  * @apiName UpdateUserReport
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to update the status of a user moderation report.
  *
  * @apiParam (Payload) {string} id The id of the user report note
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
exports.updateUserReport = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.updateUserReport' },
  validate: {
    payload: {
      id: Joi.string().required(),
      status: Joi.string().valid('Pending', 'Reviewed', 'Ignored', 'Bad Report').required(),
      reviewer_user_id: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var report = request.payload;
    db.reports.updateUserReport(report)
    .then(function(updatedReport) { reply(updatedReport); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {PUT} /admin/reports/posts (Admin) Update Post Report
  * @apiName UpdatePostReport
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to update the status of a post moderation report.
  *
  * @apiParam (Payload) {string} id The id of the post report note
  * @apiParam (Payload) {string="Pending","Reviewed","Ignored","Bad Report"} status The updated note status
  * @apiParam (Payload) {string} reviewer_user_id The id of the user updating the post report
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
  * @apiError (Error 500) InternalServerError There was an error updating the post report
  */
exports.updatePostReport = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.updatePostReport' },
  validate: {
    payload: {
      id: Joi.string().required(),
      status: Joi.string().valid('Pending', 'Reviewed', 'Ignored', 'Bad Report').required(),
      reviewer_user_id: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var report = request.payload;
    db.reports.updatePostReport(report)
    .then(function(updatedReport) { reply(updatedReport); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {PUT} /admin/reports/messages (Admin) Update Message Report
  * @apiName UpdateMessageReport
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to update the status of a message moderation report.
  *
  * @apiParam (Payload) {string} id The id of the message report note
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
exports.updateMessageReport = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.updateMessageReport' },
  validate: {
    payload: {
      id: Joi.string().required(),
      status: Joi.string().valid('Pending', 'Reviewed', 'Ignored', 'Bad Report').required(),
      reviewer_user_id: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    var report = request.payload;
    db.reports.updateMessageReport(report)
    .then(function(updatedReport) { reply(updatedReport); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {PUT} /admin/reports/usernotes (Admin) Update User Report Note
  * @apiName UpdateUserReportNote
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to update an existing note on user moderation reports.
  *
  * @apiParam (Payload) {string} id The id of the user report note
  * @apiParam (Payload) {string} note The updated note
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
  * @apiError (Error 500) InternalServerError There was an error updating the user report note
  */
exports.updateUserReportNote = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.updateUserReportNote' },
  pre: [ { method: authorization.canUpdateUserReportNote } ],
  validate: {
    payload: {
      id: Joi.string().required(),
      note: Joi.string()
    }
  },
  handler: function(request, reply) {
    var reportNote = request.payload;
    db.reports.updateUserReportNote(reportNote)
    .then(function(updatedReportNote) { reply(updatedReportNote); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {PUT} /admin/reports/usernotes (Admin) Update Post Report Note
  * @apiName UpdatePostReportNote
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to update an existing note on post moderation reports.
  *
  * @apiParam (Payload) {string} id The id of the post report note
  * @apiParam (Payload) {string} note The updated note
  *
  * @apiSuccess {string} id  The unique id for the post report note
  * @apiSuccess {string} report_id The id of the post report to leave the note on
  * @apiSuccess {string} user_id The id of the user leaving the post report note
  * @apiSuccess {string} username The username of the user who left the post report note
  * @apiSuccess {string} avatar The url to the avatar of the user who left the post report note
  * @apiSuccess {string} note The note being left on the post report
  * @apiSuccess {timestamp} created_at Timestamp of when the post report note was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the post report note was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error updating the post report note
  */
exports.updatePostReportNote = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.updatePostReportNote' },
  pre: [ { method: authorization.canUpdatePostReportNote } ],
  validate: {
    payload: {
      id: Joi.string().required(),
      note: Joi.string()
    }
  },
  handler: function(request, reply) {
    var reportNote = request.payload;
    db.reports.updatePostReportNote(reportNote)
    .then(function(updatedReportNote) { reply(updatedReportNote); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {PUT} /admin/reports/messagenotes (Admin) Update Message Report Note
  * @apiName UpdateMessageReportNote
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to update an existing note on message moderation reports.
  *
  * @apiParam (Payload) {string} id The id of the message report note
  * @apiParam (Payload) {string} note The updated note
  *
  * @apiSuccess {string} id  The unique id for the message report note
  * @apiSuccess {string} report_id The id of the message report to leave the note on
  * @apiSuccess {string} user_id The id of the user leaving the message report note
  * @apiSuccess {string} username The username of the user who left the message report note
  * @apiSuccess {string} avatar The url to the avatar of the user who left the message report note
  * @apiSuccess {string} note The note being left on the message report
  * @apiSuccess {timestamp} created_at Timestamp of when the message report note was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the message report note was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error updating the message report note
  */
exports.updateMessageReportNote = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.updateMessageReportNote' },
  pre: [ { method: authorization.canUpdateMessageReportNote } ],
  validate: {
    payload: {
      id: Joi.string().required(),
      note: Joi.string()
    }
  },
  handler: function(request, reply) {
    var reportNote = request.payload;
    db.reports.updateMessageReportNote(reportNote)
    .then(function(updatedReportNote) { reply(updatedReportNote); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {GET} /admin/reports/users (Admin) Page User Report
  * @apiName PageUserReport
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to page through user moderation reports.
  *
  * @apiParam (Query) {number} page=1 The page of user reports to retrieve
  * @apiParam (Query) {number} limit=15 The number of user reports to retrieve per page
  * @apiParam (Query) {string="Pending","Reviwed","Ignored","Bad Report"} filter Used to filter reports by their status
  * @apiParam (Query) {string="created_at","priority","reporter_username","offender_username","offender_email","offender_created_at"} field=created_at Indicates which column to sort by, used for table sorting
  * @apiParam (Query) {boolean} desc=false Boolean indicating whether or not to sort the results in descending order
  * @apiParam (Query) {string} [search] String used to search for a report by username
  *
  * @apiSuccess {object} userReports An object containing user reports and page data
  * @apiSuccess {number} userReports.count The total number of reports
  * @apiSuccess {number} userReports.limit The number of reports to bring back per page
  * @apiSuccess {number} userReports.page The current page of reports brought back
  * @apiSuccess {number} userReports.page_count The total number of pages
  * @apiSuccess {string} userReports.filter Indicates the status type of the report being brought back
  * @apiSuccess {string} userReports.field Indicates the field the reports are sorted by
  * @apiSuccess {string} userReports.search Indicates the search string
  * @apiSuccess {boolean} userReports.desc Boolean indicating if the results are in descending order
  * @apiSuccess {object[]} userReports.data An array of user reports. Sort order varies depending on the query parameters passed in.
  * @apiSuccess {string} userReports.data.id The unique id of the user report
  * @apiSuccess {string} userReports.data.status The status of the user report
  * @apiSuccess {string} userReports.data.reviewer_user_id The unique id of the user who reviewed the user report
  * @apiSuccess {timestamp} userReports.data.offender_ban_expiration If the user is banned, the expiration of their ban
  * @apiSuccess {timestamp} userReports.data.offender_created_at When the offending user created their account
  * @apiSuccess {string} userReports.data.offender_email The email of the offending user
  * @apiSuccess {string} userReports.data.offender_user_id The unique id of the offending user
  * @apiSuccess {string} userReports.data.offender_username The username of the offending user
  * @apiSuccess {string} userReports.data.reporter_reason The reason for the report
  * @apiSuccess {string} userReports.data.reporter_user_id The unique id of the reporting user
  * @apiSuccess {string} userReports.data.reporter_username The username of the reporting user
  * @apiSuccess {timestamp} userReports.data.created_at Timestamp of when the user report was created
  * @apiSuccess {timestamp} userReports.data.updated_at Timestamp of when the user report was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error retrieving the user reports
  */
exports.pageUserReports = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.pageUserReports' },
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
  handler: function(request, reply) {
    var opts = {
      page: request.query.page,
      limit: request.query.limit,
      filter: request.query.filter,
      sortField: request.query.field,
      sortDesc: request.query.desc,
      searchStr: request.query.search
    };

    var userReports = db.reports.pageUserReports(opts);
    var userReportsCount = db.reports.userReportsCount(opts);

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
    });

    return reply(promise);
  }
};

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
exports.pagePostReports = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.pagePostReports' },
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

    var postReports = db.reports.pagePostReports(opts);
    var postReportsCount = db.reports.postReportsCount(countOpts);

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
exports.pageMessageReports = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.pageMessageReports' },
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
  handler: function(request, reply) {
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      filter: request.query.filter,
      sortField: request.query.field,
      sortDesc: request.query.desc,
      searchStr: request.query.search
    };
    var messageReports = db.reports.pageMessageReports(opts);
    var messageReportsCount = db.reports.messageReportsCount(opts);

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
    });

    return reply(promise);
  }
};

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
exports.pageUserReportsNotes = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.pageUserReportsNotes' },
  validate: {
    params: { report_id: Joi.string().required() },
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      desc: Joi.boolean().default(true)
    }
  },
  handler: function(request, reply) {
    var reportId = request.params.report_id;
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      sortDesc: request.query.desc
    };

    var reportNotes = db.reports.pageUserReportsNotes(reportId, opts);
    var reportNotesCount = db.reports.userReportsNotesCount(reportId);

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

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {GET} /admin/reports/postnotes/:postReportId (Admin) Page Post Report Notes
  * @apiName PagePostReportNotes
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to page through post moderation report notes.
  *
  * @apiParam {string} postReportId The unique id of the post report to retrieve notes for
  *
  * @apiParam (Query) {number} page=1 The page of post report notes to retrieve
  * @apiParam (Query) {number} limit=10 The number of post report notes to retrieve per page
  * @apiParam (Query) {boolean} desc=true Boolean indicating whether or not to sort the results in descending order
  *
  * @apiSuccess {object} postReportNotes An object containing post report notes and page data
  * @apiSuccess {number} postReportNotes.count The total number of report notes
  * @apiSuccess {number} postReportNotes.limit The number of report notes to bring back per page
  * @apiSuccess {number} postReportNotes.page The current page of report notes brought back
  * @apiSuccess {number} postReportNotes.page_count The total number of pages
  * @apiSuccess {boolean} postReportNotes.desc Boolean indicating if the results are in descending order
  * @apiSuccess {object[]} postReportNotes.data An array of post report note objects
  * @apiSuccess {string} postReportNotes.data.id The unique id of the post report note
  * @apiSuccess {string} postReportNotes.data.report_id The unique id of the post report this note is for
  * @apiSuccess {string} postReportNotes.data.user_id The unique id of the user who left the note
  * @apiSuccess {string} postReportNotes.data.avatar The URL to the avatar of the user who left the note
  * @apiSuccess {string} postReportNotes.data.note The note message that was left on the report
  * @apiSuccess {timestamp} postReportNotes.data.created_at Timestamp of when the report note was created
  * @apiSuccess {timestamp} postReportNotes.data.updated_at Timestamp of when the report note was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error retrieving the post report notes
  */
exports.pagePostReportsNotes = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.pagePostReportsNotes' },
  validate: {
    params: { report_id: Joi.string().required() },
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      desc: Joi.boolean().default(true)
    }
  },
  handler: function(request, reply) {
    var reportId = request.params.report_id;
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      sortDesc: request.query.desc
    };

    var reportNotes = db.reports.pagePostReportsNotes(reportId, opts);
    var reportNotesCount = db.reports.postReportsNotesCount(reportId);

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

/**
  * @apiVersion 0.4.0
  * @apiGroup Reports
  * @api {GET} /admin/reports/messagenotes/:messageReportId (Admin) Page Message Report Notes
  * @apiName PageMessageReportNotes
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to page through message moderation report notes.
  *
  * @apiParam {string} messageReportId The unique id of the message report to retrieve notes for
  *
  * @apiParam (Query) {number} page=1 The page of message report notes to retrieve
  * @apiParam (Query) {number} limit=10 The number of message report notes to retrieve per page
  * @apiParam (Query) {boolean} desc=true Boolean indicating whether or not to sort the results in descending order
  *
  * @apiSuccess {object} messageReportNotes An object containing message report notes and page data
  * @apiSuccess {number} messageReportNotes.count The total number of report notes
  * @apiSuccess {number} messageReportNotes.limit The number of report notes to bring back per page
  * @apiSuccess {number} messageReportNotes.page The current page of report notes brought back
  * @apiSuccess {number} messageReportNotes.page_count The total number of pages
  * @apiSuccess {boolean} messageReportNotes.desc Boolean indicating if the results are in descending order
  * @apiSuccess {object[]} messageReportNotes.data An array of message report note objects.
  * @apiSuccess {string} messageReportNotes.data.id The unique id of the message report note
  * @apiSuccess {string} messageReportNotes.data.report_id The unique id of the message report this note is for
  * @apiSuccess {string} messageReportNotes.data.user_id The unique id of the user who left the note
  * @apiSuccess {string} messageReportNotes.data.avatar The URL to the avatar of the user who left the note
  * @apiSuccess {string} messageReportNotes.data.note The note message that was left on the report
  * @apiSuccess {timestamp} messageReportNotes.data.created_at Timestamp of when the report note was created
  * @apiSuccess {timestamp} messageReportNotes.data.updated_at Timestamp of when the report note was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error retrieving the message report notes
  */
exports.pageMessageReportsNotes = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminReports.pageMessageReportsNotes' },
  validate: {
    params: { report_id: Joi.string().required() },
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      desc: Joi.boolean().default(true)
    }
  },
  handler: function(request, reply) {
    var reportId = request.params.report_id;
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      sortDesc: request.query.desc
    };

    var reportNotes = db.reports.pageMessageReportsNotes(reportId, opts);
    var reportNotesCount = db.reports.messageReportsNotesCount(reportId);

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
