var Joi = require('joi');

var rawUserSchema = Joi.object().keys({
  username: Joi.string().regex(/[a-zA-Z0-9_\-]/).min(2).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
  confirmation: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
});

var updateUserSchema = Joi.object().keys({
  id: Joi.string().required(),
  username: Joi.string().regex(/[a-zA-Z0-9_\-]/).min(2).max(30),
  email: Joi.string().email(),
  password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/),
  confirmation: Joi.ref('password')
}).with('password', 'confirmation');

module.exports = {
  rawUserSchema: rawUserSchema,
  validate: function(user, options, next) {
    Joi.validate(user, rawUserSchema, { stripUnknown: true }, next);
  },
  validateId: function(user, options, next) {
    Joi.validate(user, { id: Joi.string().required() }, next);
  },
  validateUpdate: function(user, options, next) {
    Joi.validate(user, updateUserSchema, { stripUnknown: true }, next);
  }
};
