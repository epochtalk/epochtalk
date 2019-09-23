var Joi = require('@hapi/joi');

var validation =  Joi.object().keys({
  create: Joi.object().keys({
    allow: Joi.boolean()
  }),
  delete: Joi.object().keys({
    allow: Joi.boolean()
  })
});

var superAdministrator = {
  create: { allow: true },
  delete: { allow: true }
};

var administrator = {
  create: { allow: true },
  delete: { allow: true }
};

var layout = {
  create: { title: 'Create Categories' },
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
