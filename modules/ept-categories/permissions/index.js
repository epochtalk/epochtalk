var Joi = require('joi');

var validation =  Joi.object().keys({
  create: Joi.object().keys({
    allow: Joi.boolean()
  }),
  find: Joi.object().keys({
    allow: Joi.boolean()
  }),
  all: Joi.object().keys({
    allow: Joi.boolean()
  }),
  delete: Joi.object().keys({
    allow: Joi.boolean()
  })
});

var superAdministrator = {
  create: { allow: true },
  find: { allow: true },
  all: { allow: true },
  delete: { allow: true }
};

var administrator = {
  create: { allow: true },
  find: { allow: true },
  all: { allow: true },
  delete: { allow: true }
};

var layout = {
  create: { title: 'Create Categories' },
  find: { title: 'View Single Categories' },
  all: { title: 'Update Categories' },
  delete: { title: 'Delete Categories' }
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
