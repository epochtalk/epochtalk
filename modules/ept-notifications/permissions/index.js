var Joi = require('joi');

var allPermissions = {
  counts: { allow: true },
  dismiss: { allow: true }
};

var noPermissions = {};

module.exports = [{
  name: 'notifications',
  data: {
    validation: Joi.object().keys({
      counts: Joi.object().keys({
        allow: Joi.boolean()
      }),
      dismiss: Joi.object().keys({
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
