var Joi = require('joi');

var allPermissions = {
  send: { allow: true }
};

var noPermissions = {};

var merit = {
  validation: Joi.object().keys({
    send: Joi.object().keys({
      allow: Joi.boolean()
    })
  }),

  layout: {
    send: { title: 'Allow user to send merit to other user\'s' }
  },

  defaults: {
    superAdministrator: allPermissions,
    administrator: allPermissions,
    globalModerator: allPermissions,
    moderator: allPermissions,
    patroller: allPermissions,
    user: allPermissions,
    newbie: noPermissions,
    banned: noPermissions,
    anonymous: noPermissions,
    private: noPermissions
  }
};

module.exports = [{
  name: 'merit',
  data: merit
}];
