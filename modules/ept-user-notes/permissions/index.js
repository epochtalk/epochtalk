var Joi = require('@hapi/joi');

var allPermissions = {
  create: { allow: true },
  delete: { allow: true},
  page: { allow: true },
  update: { allow: true }
};

var noPermissions = {};

module.exports = [{
  name: 'userNotes',
  data: {
  validation: Joi.object().keys({
      create: Joi.object().keys({
        allow: Joi.boolean()
      }),
      delete: Joi.object().keys({
        allow: Joi.boolean()
      }),
      page: Joi.object().keys({
        allow: Joi.boolean()
      }),
      update: Joi.object().keys({
        allow: Joi.boolean()
      })
    }),

    layout: {
      create: { title: 'Allow user to leave moderation notes on user profiles (Admin/Mod only recommended)' },
      delete: { title: 'Allow user to delete their own moderation notes from user profiles (Admin/Mod only recommended)' },
      page: { title: 'Allows user to page moderation notes left on user profiles (Admin/Mod only recommended)' },
      update: { title: 'Allow user to update their own moderation notes left on user profiles (Admin/Mod only recommended)' }
    },

    defaults: {
      superAdministrator: allPermissions,
      administrator: allPermissions,
      globalModerator: allPermissions,
      moderator: allPermissions,
      patroller: noPermissions,
      user: noPermissions,
      newbie: noPermissions,
      banned: noPermissions,
      anonymous: noPermissions,
      private: noPermissions
    }
  }
}];
