var Joi = require('joi');

var rawBoardSchema = Joi.object().keys({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string(),
  parent_id: Joi.string()
});

module.exports = {
  rawBoardSchema: rawBoardSchema,
  validate: function(board, options, next) {
    Joi.validate(board, rawBoardSchema, next);
  },
  validateId: function(board, options, next) {
    Joi.validate(board, { id: Joi.string().required() }, next);
  }
};