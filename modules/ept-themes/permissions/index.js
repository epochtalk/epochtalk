var Joi = require('@hapi/joi');

var allPermissions = {
  getTheme: { allow: true },
  previewTheme: { allow: true },
  resetTheme: { allow: true },
  setTheme: { allow: true }
};

var noPermissions = {};

module.exports = [{
  name: 'themes',
  data: {
    validation: Joi.object({
      getTheme: Joi.object({
        allow: Joi.boolean()
      }),
      previewTheme: Joi.object({
        allow: Joi.boolean()
      }),
      resetTheme: Joi.object({
        allow: Joi.boolean()
      }),
      setTheme: Joi.object({
        allow: Joi.boolean()
      })
    }),

    layout: {
      getTheme: { title: 'Allow user to fetch forum css for editing (Admin only recommended)' },
      previewTheme: { title: 'Allow user to preview a theme (Admin only recommended)' },
      resetTheme: { title: 'Allow user to reset forum to default theme (Admin only recommended)' },
      setTheme: { title: 'Allow user to change the forum theme (Admin only recommended)' }
    },

    defaults: {
      superAdministrator: allPermissions,
      administrator: noPermissions,
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
