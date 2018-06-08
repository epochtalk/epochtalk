var Joi = require('joi');

var allPermissions = {
  send: { allow: true },
  getStatistics: { allow: true },
  getUserStatistics: { allow: true }
};

var viewStatsPermissions = {
  getStatistics: { allow: true },
  getUserStatistics: { allow: true }
};

var noPermissions = {};

var merit = {
  validation: Joi.object().keys({
    send: Joi.object().keys({
      allow: Joi.boolean()
    }),
    getStatistics: Joi.object().keys({
      allow: Joi.boolean()
    }),
    getUserStatistics: Joi.object().keys({
      allow: Joi.boolean()
    })
  }),

  layout: {
    send: { title: 'Allow user to send merit to other user\'s' },
    getStatistics: { title: 'Allow user to get global merit statistics' },
    getUserStatistics: { title: 'Allow user to get merit statistics on other users and themeselves' }
  },

  defaults: {
    superAdministrator: allPermissions,
    administrator: allPermissions,
    globalModerator: allPermissions,
    moderator: allPermissions,
    patroller: allPermissions,
    user: allPermissions,
    newbie: viewStatsPermissions,
    banned: noPermissions,
    anonymous: noPermissions,
    private: noPermissions
  }
};

module.exports = [{
  name: 'merit',
  data: merit
}];
