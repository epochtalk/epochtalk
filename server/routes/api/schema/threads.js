var Joi = require('joi');

module.exports = {
  validate: function(thread, options, next) {
    var threadSchema = Joi.object().keys({
      title: Joi.string().min(1).max(255).required(),
      body: Joi.string().min(1).required(), // 1 char minimum post length
      encodedBody: Joi.string().min(1),
      board_id: Joi.string()
    });
    Joi.validate(thread, threadSchema, next);
  },
  validateByBoard: function(params, options, next) {
    if (Object.getOwnPropertyNames(params).length === 0) {
      return next();
    }
    var threadByBoardSchema = {
      board_id: Joi.string().required(),
      page: Joi.number(),
      limit: Joi.number().integer().min(1)
    };
    Joi.validate(params, threadByBoardSchema, next);
  }
};