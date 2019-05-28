var Joi = require('joi');

var allPermissions = {
  page: { allow: true }
};

var noPermissions = {};

module.exports = [{
  name: 'moderationLogs',
  data: {
    validation: Joi.object().keys({
      page: Joi.object().keys({
        allow: Joi.boolean()
      })
    }),

    layout: {
      page: { title: 'Allow User to page through Moderation Logs' }
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
