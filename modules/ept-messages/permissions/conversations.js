var Joi = require('@hapi/joi');

var validation =  Joi.object().keys({
  create: Joi.object().keys({
    allow: Joi.boolean()
  }),
  delete: Joi.object().keys({
    allow: Joi.boolean()
  }),
  messages: Joi.object().keys({
    allow: Joi.boolean()
  })
});

var superAdministrator = {
  create: { allow: true },
  delete: { allow: true },
  messages: { allow: true },
};

var administrator = {
  create: { allow: true },
  delete: { allow: true },
  messages: { allow: true },
};

var globalModerator = {
  create: { allow: true },
  delete: { allow: true },
  messages: { allow: true }
};

var moderator = {
  create: { allow: true },
  delete: { allow: true },
  messages: { allow: true }
};

var patroller = {
  create: { allow: true },
  delete: { allow: true },
  messages: { allow: true }
};

var user = {
  create: { allow: true },
  delete: { allow: true },
  messages: { allow: true }
};

var newbie = {
  create: { allow: true },
  delete: { allow: true },
  messages: { allow: true }
};

var banned = {
  create: { allow: true },
  delete: { allow: true },
  messages: { allow: true }
};

var layout = {
  create: { title: 'Create Conversations' },
  delete: { title: 'Delete Conversations' },
  messages: { title: 'View Conversations' }
};

module.exports = {
  validation: validation,
  layout: layout,
  defaults: {
    superAdministrator: superAdministrator,
    administrator: administrator,
    globalModerator: globalModerator,
    moderator: moderator,
    patroller: patroller,
    user: user,
    newbie: newbie,
    banned: banned,
    anonymous: {},
    private: {}
  }
};
