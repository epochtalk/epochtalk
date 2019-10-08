var Joi = require('@hapi/joi');

var allPermissions = {
  counts: { allow: true },
  dismiss: { allow: true }
};

var noPermissions = {};

module.exports = [{
  name: 'notifications',
  data: {
    validation: Joi.object({
      counts: Joi.object({
        allow: Joi.boolean()
      }),
      dismiss: Joi.object({
        allow: Joi.boolean()
      })
    }),

    layout: {
      counts: { title: 'Allow user to get their notifications counts' },
      dismiss: { title: 'Allow user to dismiss their notifications' }
    },

    defaults: {
      superAdministrator: allPermissions,
      administrator: allPermissions,
      globalModerator: allPermissions,
      moderator: allPermissions,
      patroller: allPermissions,
      user: allPermissions,
      newbie: allPermissions,
      banned: allPermissions,
      anonymous: noPermissions,
      private: noPermissions
    }
  }
}];
