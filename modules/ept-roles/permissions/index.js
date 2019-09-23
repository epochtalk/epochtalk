var Joi = require('@hapi/joi');

var allPermissions = {
  all: { allow: true },
  users: { allow: true },
  add: { allow: true},
  update: { allow: true },
  remove: { allow: true },
  reprioritize: { allow: true }
};

var viewPermissions = {
  all: { allow: true },
  users: { allow: true }
};

var noPermissions = {};

module.exports = [{
  name: 'roles',
  data: {
  validation: Joi.object().keys({
      all: Joi.object().keys({
        allow: Joi.boolean()
      }),
      users: Joi.object().keys({
        allow: Joi.boolean()
      }),
      add: Joi.object().keys({
        allow: Joi.boolean()
      }),
      update: Joi.object().keys({
        allow: Joi.boolean()
      }),
      remove: Joi.object().keys({
        allow: Joi.boolean()
      }),
      reprioritize: Joi.object().keys({
        allow: Joi.boolean()
      })
    }),

    layout: {
      all: { title: 'Allow user to query a list of all the roles (Admin only recommended)' },
      users: { title: 'Allow user to query a list of all users within a role (Admin only recommended)' },
      add: { title: 'Allows user to create new roles (Admin only recommended)' },
      update: { title: 'Allow user to update existing roles (Admin only recommended)' },
      remove: { title: 'Allow user to delete non-default roles (Admin only recommended)' },
      reprioritize: { title: 'Allow user to reprioritize roles (Admin only recommended)' },
    },

    defaults: {
      superAdministrator: allPermissions,
      administrator: viewPermissions,
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
