var Joi = require('joi');

var allPermissions = {
  addRule: { allow: true },
  all: { allow: true },
  deleteRule: { allow: true },
  updateRule: { allow: true }
};

var noPermissions = {};

module.exports = [{
  name: 'blacklist',
  data: {
    validation: Joi.object().keys({
      addRule: Joi.object().keys({
        allow: Joi.boolean()
      }),
      all: Joi.object().keys({
        allow: Joi.boolean()
      }),
      deleteRule: Joi.object().keys({
        allow: Joi.boolean()
      }),
      updateRule: Joi.object().keys({
        allow: Joi.boolean()
      })
    }),

    layout: {
      addRule: { title: 'Allow User to blacklist IP addresses and hostnames (Admin only)' },
      all: { title: 'Allow User to get list of blacklisted IP addresses and hostnames (Admin only)' },
      deleteRule: { title: 'Allow User to delete blacklisted IP addresses and hostnames (Admin only)' },
      updateRule: { title: 'Allow User to update blacklisted IP addresses and hostnames (Admin only)' }
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
