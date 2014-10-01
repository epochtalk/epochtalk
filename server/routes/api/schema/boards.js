var Joi = require('joi');

var rawBoardSchema = Joi.object().keys({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string(),
  parent_id: Joi.string(),
  children_ids: Joi.array()
});

var updateBoardSchema = Joi.object().keys({
  name: Joi.string().min(1).max(255),
  description: Joi.string(),
  parent_id: Joi.string(),
  children_ids: Joi.array()
});

module.exports = {
  rawBoardSchema: rawBoardSchema,
  validate: function(board, options, next) {
    Joi.validate(board, rawBoardSchema, next);
  },
  validateUpdate: function(board, options, next) {
    Joi.validate(board, updateBoardSchema, next);
  },
  validateCategories: function(categories, options, next) {
    Joi.validate(categories, { categories: Joi.array().required() }, next);
  },
  validateId: function(board, options, next) {
    Joi.validate(board, { id: Joi.string().required() }, next);
  }
};