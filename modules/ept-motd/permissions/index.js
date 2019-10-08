var Joi = require('@hapi/joi');

var allPermissions = {
  get: { allow: true },
  save: { allow: true }
};

var noSavePermissions = {
  get: { allow: true }
};


var motd = {
  validation: Joi.object({
    save: Joi.object({
      allow: Joi.boolean()
    }),
    get: Joi.object({
      allow: Joi.boolean()
    })
  }),

  layout: {
    save: { title: 'Allow user to update site announcements, should only be given to admins' },
    get: { title: 'Allow User to view site announcements' }
  },

  defaults: {
    superAdministrator: allPermissions,
    administrator: allPermissions,
    globalModerator: noSavePermissions,
    moderator: noSavePermissions,
    patroller: noSavePermissions,
    user: noSavePermissions,
    newbie: noSavePermissions,
    banned: noSavePermissions,
    anonymous: noSavePermissions,
    private: noSavePermissions
  }
};

module.exports = [{
  name: 'motd',
  data: motd
}];
