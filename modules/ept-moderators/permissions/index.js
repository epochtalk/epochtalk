var Joi = require('@hapi/joi');

var allPermissions = {
  add: { allow: true },
  remove: { allow: true }
};

var noPermissions = {};

module.exports = [{
  name: 'moderators',
  data: {
    validation: Joi.object().keys({
      add: Joi.object().keys({
        allow: Joi.boolean()
      }),
      remove: Joi.object().keys({
        allow: Joi.boolean()
      })
    }),

    layout: {
      add: { title: 'Allow user to add moderators to boards (Admin only recommended)' },
      remove: { title: 'Allow user to add moderators to boards (Admin only recommended)' }
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
  }
}];
