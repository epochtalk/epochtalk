var Joi = require('joi');

var validation =  Joi.object().keys({
  rules: Joi.object().keys({
    allow: Joi.boolean()
  }),
  addRule: Joi.object().keys({
    allow: Joi.boolean()
  }),
  editRule: Joi.object().keys({
    allow: Joi.boolean()
  }),
  removeRule: Joi.object().keys({
    allow: Joi.boolean()
  })
});

var superAdministrator = {
  rules: { allow: true },
  addRule: { allow: true },
  editRule: { allow: true },
  removeRule: { allow: true }
};

var administrator = {
  rules: { allow: true },
  addRule: { allow: true },
  editRule: { allow: true },
  removeRule: { allow: true }
};

var layout = {
  rules: { title: 'View AutoModeration Rules' },
  addRule: { title: 'Add a Rule' },
  editRule: { title: 'Edit a Rule' },
  removeRule: { title: 'Remove a Rule' }
};

module.exports = {
  validation: validation,
  layout: layout,
  defaults: {
    superAdministrator: superAdministrator,
    administrator: administrator,
    globalModerator: {},
    moderator: {},
    patroller: {},
    user: {},
    newbie: {},
    banned: {},
    anonymous: {},
    private: {}
  }
};
