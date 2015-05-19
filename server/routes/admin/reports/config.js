var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var commonAdminPre = require(path.normalize(__dirname + '/../../common')).admin;
var db = require(path.normalize(__dirname + '/../../../../db'));

// Create Operations
exports.createUserReportNote = {
 auth: { mode: 'required', strategy: 'jwt' },
 pre: [ { method: commonAdminPre.adminCheck } ],
  validate: {
    payload: {
      report_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      user_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
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

exports.createPostReportNote = {
 auth: { mode: 'required', strategy: 'jwt' },
 pre: [ { method: commonAdminPre.adminCheck } ],
  validate: {
    payload: {
      report_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      user_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
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

// Update Operations
exports.updateUserReport = {
 auth: { mode: 'required', strategy: 'jwt' },
 pre: [ { method: commonAdminPre.adminCheck } ],
  validate: {
    payload: {
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      status: Joi.string().valid('Pending', 'Reviewed', 'Ignored', 'Bad Report').required(),
      reviewer_user_id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    }
  },
  handler: function(request, reply) {
    var report = request.payload;
    db.reports.updateUserReport(report)
    .then(function(updatedReport) { reply(updatedReport); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.updatePostReport = {
 auth: { mode: 'required', strategy: 'jwt' },
 pre: [ { method: commonAdminPre.adminCheck } ],
  validate: {
    payload: {
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      status: Joi.string().valid('Pending', 'Reviewed', 'Ignored', 'Bad Report').required(),
      reviewer_user_id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    }
  },
  handler: function(request, reply) {
    var report = request.payload;
    db.reports.updatePostReport(report)
    .then(function(updatedReport) { reply(updatedReport); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.updateUserReportNote = {
 auth: { mode: 'required', strategy: 'jwt' },
 pre: [ { method: commonAdminPre.adminCheck } ],
  validate: {
    payload: {
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
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

exports.updatePostReportNote = {
 auth: { mode: 'required', strategy: 'jwt' },
 pre: [ { method: commonAdminPre.adminCheck } ],
  validate: {
    payload: {
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
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

// Paging Operations
exports.pageUserReports = {
  auth: { mode: 'required', strategy: 'jwt' },
  pre: [ { method: commonAdminPre.adminCheck } ],
  validate: {
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).default(15),
      filter: Joi.string().valid('Pending', 'Reviewed', 'Ignored', 'Bad Report'),
      field: Joi.string().default('created_at').valid('created_at', 'priority'),
      desc: Joi.boolean().default(true)
    }
  },
  handler: function(request, reply) {
    var opts = {
      limit: request.query.limit || 10,
      page: request.query.page || 1,
      filter: request.query.filter || undefined,
      sortField: request.query.field || 'username',
      sortDesc: request.query.desc || false
    };
    db.reports.pageUserReports(opts)
    .then(function(reports) { reply(reports); });
  }
};

exports.pagePostReports = {
  auth: { mode: 'required', strategy: 'jwt' },
  pre: [ { method: commonAdminPre.adminCheck } ],
  validate: {
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).default(15),
      filter: Joi.string().valid('Pending', 'Reviewed', 'Ignored', 'Bad Report'),
      field: Joi.string().default('created_at').valid('created_at', 'priority'),
      desc: Joi.boolean().default(true)
    }
  },
  handler: function(request, reply) {
    var opts = {
      limit: request.query.limit || 10,
      page: request.query.page || 1,
      filter: request.query.filter || undefined,
      sortField: request.query.field || 'username',
      sortDesc: request.query.desc || false
    };
    db.reports.pagePostReports(opts)
    .then(function(reports) { reply(reports); });
  }
};

exports.pageUserReportsNotes = {
  auth: { mode: 'required', strategy: 'jwt' },
  pre: [ { method: commonAdminPre.adminCheck } ],
  validate: {
    params: { report_id: Joi.alternatives().try(Joi.string(), Joi.number()).required() },
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).default(10),
      desc: Joi.boolean().default(false)
    }
  },
  handler: function(request, reply) {
    var reportId = request.params.report_id;
    var opts = {
      limit: request.query.limit || 10,
      page: request.query.page || 1,
      sortDesc: request.query.desc || false
    };
    db.reports.pageUserReportsNotes(reportId, opts)
    .then(function(reports) { reply(reports); });
  }
};

exports.pagePostReportsNotes = {
  auth: { mode: 'required', strategy: 'jwt' },
  pre: [ { method: commonAdminPre.adminCheck } ],
  validate: {
    params: { report_id: Joi.alternatives().try(Joi.string(), Joi.number()).required() },
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).default(10),
      desc: Joi.boolean().default(false)
    }
  },
  handler: function(request, reply) {
    var reportId = request.params.report_id;
    var opts = {
      limit: request.query.limit || 10,
      page: request.query.page || 1,
      sortDesc: request.query.desc || false
    };
    db.reports.pagePostReportsNotes(reportId, opts)
    .then(function(reports) { reply(reports); });
  }
};
