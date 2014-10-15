var Joi = require('joi');

var breadcrumbSchema = Joi.object().keys({
  id: Joi.string().required(),
  type: Joi.string().required()
});

module.exports = {
  validate: function(breadcrumbReq, options, next) {
    Joi.validate(breadcrumbReq, breadcrumbSchema, next);
  }
};