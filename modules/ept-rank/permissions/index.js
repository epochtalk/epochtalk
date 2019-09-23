var Joi = require('@hapi/joi');

var allPermissions = {
  upsert: { allow: true },
  get: { allow: true }
};

var noPermissions = {};

var rank = {
  validation: Joi.object().keys({
    upsert: Joi.object().keys({
      allow: Joi.boolean()
    }),
    get: Joi.object().keys({
      allow: Joi.boolean()
    })
  }),

  layout: {
    upsert: { title: 'Allow user to create/update/remove existing user ranks, should only be given to admins' },
    get: { title: 'Allow user to retrieve a list of all user ranks and their thresholds, should only be given to admins' }
  },

  defaults: {
    superAdministrator: allPermissions,
    administrator: allPermissions,
    globalModerator: noPermissions,
    moderator: noPermissions,
    patroller: noPermissions,
    user: noPermissions,
    newbie: noPermissions,
    banned: noPermissions,
    anonymous: noPermissions,
    private: noPermissions
  }
};

module.exports = [{
  name: 'rank',
  data: rank
}];
