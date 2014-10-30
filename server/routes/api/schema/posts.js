var Joi = require('joi');

var rawPostSchema = Joi.object().keys({
  title: Joi.string().min(1).max(255).required(),
  body: Joi.string().allow(''),
  encodedBody: Joi.string().required(),
  thread_id: Joi.string().required()
});

module.exports = {
  rawPostSchema: rawPostSchema,
  validate: function(post, options, next) {
    var postSchema = rawPostSchema.with('title', 'thread_id');
    Joi.validate(post, postSchema, next);
  },
  validateId: function(post, options, next) {
    Joi.validate(post, { id: Joi.string().required() }, next);
  },
  validateByThread: function(params, options, next) {
    if (Object.getOwnPropertyNames(params).length === 0) {
     return next();
    }
    var postByThreadSchema = {
      thread_id: Joi.string().required(),
      page: Joi.number().integer(),
      limit: Joi.number().integer().min(1)
    };
    Joi.validate(params, postByThreadSchema, next);
  }
};