var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var db = require(path.normalize(__dirname + '/../../../db'));

// Create Operations
exports.createUserReport = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: {
    payload: {
      reporter_user_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      reporter_reason: Joi.string().required(),
      offender_user_id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    }
  },
  handler: function(request, reply) {
    var report = request.payload;
    db.reports.createUserReport(report)
    .then(function(createdReport) { reply(createdReport); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.createPostReport = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: {
    payload: {
      reporter_user_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      reporter_reason: Joi.string().required(),
      offender_post_id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    }
  },
  handler: function(request, reply) {
    var report = request.payload;
    db.reports.createPostReport(report)
    .then(function(createdReport) { reply(createdReport); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};
