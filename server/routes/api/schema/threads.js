var Joi = require('joi');
var postSchema = require(__dirname + '/posts');

module.exports = {
  validate: function(thread, options, next) {
    var threadSchema = postSchema.rawPostSchema.with('title', 'body', 'board_id').without('board_id', ['thread_id']);
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