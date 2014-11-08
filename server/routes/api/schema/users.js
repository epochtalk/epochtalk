var joi = require('joi');

var rawUserSchema = joi.object().keys({
  username: joi.string().regex(/[a-zA-Z0-9_\-]/).min(2).max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
  confirmation: joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
});

var updateUserSchema = joi.object().keys({
  id: joi.string().required(),
  username: joi.string().regex(/[a-zA-Z0-9_\-]/).min(2).max(30),
  email: joi.string().email(),
  password: joi.string(),
  confirmation: joi.ref('password'),
  name: joi.string(),
  website: joi.string(),
  btcAddress: joi.string(),
  gender: joi.string(),
  dob: joi.date(),
  location: joi.string(),
  language: joi.string(),
  signature: joi.string(),
  avatar: joi.string() // url
}).with('password', 'confirmation');

var userImportSchema = joi.object().keys({
  username: joi.string().required(),
  email: joi.string(), // should be required?
  created_at: joi.number(),
  updated_at: joi.number(),
  name: joi.string(),
  website: joi.string(),
  gender: joi.string(),
  dob: joi.date(),
  location: joi.string(),
  language: joi.string(),
  signature: joi.string(),
  avatar: joi.string(), // url
  status: joi.string(),
  smf: {
    ID_MEMBER: joi.number().required()
  }
});

module.exports = {
  rawUserSchema: rawUserSchema,
  validate: function(user, options, next) {
    joi.validate(user, rawUserSchema, { stripUnknown: true }, next);
  },
  validateId: function(user, options, next) {
    joi.validate(user, { id: joi.string().required() }, next);
  },
  validateUpdate: function(user, options, next) {
    joi.validate(user, updateUserSchema, { stripUnknown: true }, next);
  },
  validateImport: function(user, options, next) {
    joi.validate(user, userImportSchema, next);
  }
};
