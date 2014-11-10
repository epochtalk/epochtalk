var Joi = require('joi');

var loginSchema = Joi.object().keys({
  username: Joi.string().min(1).max(255).required(),
  password: Joi.string().required()
});

var resetPasswordSchema = Joi.object().keys({
  username: Joi.string().min(1).max(255).required(),
  password: Joi.string().required(),
  confirmation: Joi.ref('password'),
  token: Joi.string().required()
});

var registerSchema = Joi.object().keys({
  username: Joi.string().regex(/[a-zA-Z0-9_\-]/).min(1).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
  confirmation: Joi.ref('password')
});

module.exports = {
  loginSchema: loginSchema,
  registerSchema: registerSchema,
  validateLogin: function(login, options, next) {
    Joi.validate(login, loginSchema, next);
  },
  validateRegister: function(register, options, next) {
    Joi.validate(register, registerSchema, next);
  },
  validateResetPassword: function(reset, options, next) {
    Joi.validate(reset, resetPasswordSchema, next);
  }
};