var Joi = require('@hapi/joi');

var allPermissions = {
  all: { allow: true },
  invite: { allow: true },
  remove: { allow: true },
  resend: { allow: true }
};

var invitePermissions = {
  invite: { allow: true }
};

var noPermissions = {};

module.exports = [{
  name: 'invitations',
  data: {
    validation: Joi.object().keys({
      all: Joi.object().keys({
        allow: Joi.boolean()
      }),
      invite: Joi.object().keys({
        allow: Joi.boolean()
      }),
      remove: Joi.object().keys({
        allow: Joi.boolean()
      }),
      resend: Joi.object().keys({
        allow: Joi.boolean()
      })
    }),

    layout: {
      all: { title: 'Allow User to fetch all open invitations (Admin only)' },
      remove: { title: 'Allow User to remove invitations (Admin only)' },
      resend: { title: 'Allow User to resend invitations (Admin only)' },
      invite: { title: 'Allow User to invite other users to register' }
    },

    defaults: {
      superAdministrator: allPermissions,
      administrator: allPermissions,
      globalModerator: invitePermissions,
      moderator: invitePermissions,
      patroller: invitePermissions,
      user: invitePermissions,
      newbie: noPermissions,
      banned: noPermissions,
      anonymous: noPermissions,
      private: noPermissions
    }
  }
}];
