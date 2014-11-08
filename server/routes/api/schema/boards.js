var joi = require('joi');

var rawBoardSchema = joi.object().keys({
  name: joi.string().min(1).max(255).required(),
  description: joi.string().allow(''),
  parent_id: joi.string(),
  children_ids: joi.array()
});

var updateBoardSchema = joi.object().keys({
  name: joi.string().min(1).max(255),
  description: joi.string().allow(''),
  parent_id: joi.string(),
  children_ids: joi.array()
});

var boardImportSchema = joi.object().keys({
  name: joi.string().required(),
  description: joi.string(),
  category_id: joi.number(),
  created_at: joi.number(),
  updated_at: joi.number(),
  parent_id: joi.string(),
  children_ids: joi.array(joi.string()),
  deleted: joi.boolean(),
  smf: {
    ID_BOARD: joi.number(),
    ID_PARENT: joi.number()
  }
});

module.exports = {
  rawBoardSchema: rawBoardSchema,
  validate: function(board, options, next) {
    joi.validate(board, rawBoardSchema, next);
  },
  validateUpdate: function(board, options, next) {
    joi.validate(board, updateBoardSchema, next);
  },
  validateImport: function(board, options, next) {
    joi.validate(board, boardImportSchema, next);
  },
  validateCategories: function(categories, options, next) {
    joi.validate(categories, { categories: joi.array().required() }, next);
  },
  validateId: function(board, options, next) {
    joi.validate(board, { id: joi.string().required() }, next);
  }
};
