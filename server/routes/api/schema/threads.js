var joi = require('joi');
var _ = require('lodash');

var threadByBoardSchema = {
  board_id: joi.string().required(),
  page: joi.number(),
  limit: joi.number().integer().min(1)
};

var threadSchema = joi.object().keys({
  title: joi.string().min(1).max(255).required(),
  body: joi.string().allow(''),
  encodedBody: joi.string().required(),
  board_id: joi.string().required()
});

var threadImportSchema = joi.object().keys({
  board_id: joi.string().required(),
  created_at: joi.number(),
  updated_at: joi.number(),
  view_count: joi.number(),
  deleted: joi.boolean(),
  smf: {
    ID_MEMBER: joi.number(),
    ID_TOPIC: joi.number(),
    ID_FIRST_MSG: joi.number()
  }
});

module.exports = {
  validate: function(thread, options, next) {
    joi.validate(thread, threadSchema, next);
  },
  validateParamsByBoard: function(params, options, next) {
    if (_.isEmpty(params)) { return next(); }
    joi.validate(params, threadByBoardSchema, next);
  },
  validateQueryByBoard: function(params, options, next) {
    if (_.isEmpty(params)) { return next(); }
    joi.validate(params, threadByBoardSchema, next);
  },
  validateImport: function(params, options, next) {
    joi.validate(params, threadImportSchema, next);
  }
};
