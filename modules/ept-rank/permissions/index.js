var Joi = require('joi');

var allPermissions = {
  add: { allow: true },
  update: { allow: true },
  remove: { allow: true },
  get: { allow: true }
};

var noPermissions = {};

var rank = {
  validation: Joi.object().keys({
    add: Joi.object().keys({
      allow: Joi.boolean()
    }),
    update: Joi.object().keys({
      allow: Joi.boolean()
    }),
    remove: Joi.object().keys({
      allow: Joi.boolean()
    }),
    get: Joi.object().keys({
      allow: Joi.boolean()
    })
  }),

  layout: {
    add: { title: 'Allow user to create new user ranks, should only be given to admins' },
    update: { title: 'Allow user to update existing user ranks, should only be given to admins' },
    remove: { title: 'Allow user to remove existing user ranks, should only be given to admins' },
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
