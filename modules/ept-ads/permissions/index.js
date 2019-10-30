var Joi = require('@hapi/joi');

var validation =  Joi.object({
  // Ads
  create: Joi.object({
    allow: Joi.boolean()
  }),
  duplicate: Joi.object({
    allow: Joi.boolean()
  }),
  edit: Joi.object({
    allow: Joi.boolean()
  }),
  remove: Joi.object({
    allow: Joi.boolean()
  }),
  view: Joi.object({
    allow: Joi.boolean()
  }),
  // Analytics
  analyticsView: Joi.object({
    allow: Joi.boolean()
  }),
  // Factoids
  factoidCreate: Joi.object({
    allow: Joi.boolean()
  }),
  factoidDisable: Joi.object({
    allow: Joi.boolean()
  }),
  factoidEdit: Joi.object({
    allow: Joi.boolean()
  }),
  factoidEnable: Joi.object({
    allow: Joi.boolean()
  }),
  factoidRemove: Joi.object({
    allow: Joi.boolean()
  }),
  // Rounds
  roundCreate: Joi.object({
    allow: Joi.boolean()
  }),
  roundInfo: Joi.object({
    allow: Joi.boolean()
  }),
  roundRotate: Joi.object({
    allow: Joi.boolean()
  }),
  roundView: Joi.object({
    allow: Joi.boolean()
  }),
  // Text
  textSave: Joi.object({
    allow: Joi.boolean()
  })
});

var superAdministrator = {
  create: { allow: true },
  duplicate: { allow: true },
  edit: { allow: true },
  remove: { allow: true },
  view: { allow: true },
  analyticsView: { allow: true },
  factoidCreate: { allow: true },
  factoidDisable: { allow: true },
  factoidEdit: { allow: true },
  factoidEnable: { allow: true },
  factoidRemove: { allow: true },
  roundCreate: { allow: true },
  roundInfo: { allow: true },
  roundRotate: { allow: true },
  roundView: { allow: true },
  textSave: { allow: true },
};

var administrator = {
  create: { allow: true },
  duplicate: { allow: true },
  edit: { allow: true },
  remove: { allow: true },
  view: { allow: true },
  analyticsView: { allow: true },
  factoidCreate: { allow: true },
  factoidDisable: { allow: true },
  factoidEdit: { allow: true },
  factoidEnable: { allow: true },
  factoidRemove: { allow: true },
  roundCreate: { allow: true },
  roundInfo: { allow: true },
  roundRotate: { allow: true },
  roundView: { allow: true },
  textSave: { allow: true },
};

var globalModerator = {
  view: { allow: true },
  analyticsView: { allow: true },
  roundInfo: { allow: true }
};

var moderator = {
  view: { allow: true },
  analyticsView: { allow: true },
  roundInfo: { allow: true }
};

var patroller = {
  view: { allow: true },
  analyticsView: { allow: true },
  roundInfo: { allow: true }
};

var user = {
  view: { allow: true },
  analyticsView: { allow: true },
  roundInfo: { allow: true }
};

var newbie = {
  view: { allow: true },
  analyticsView: { allow: true },
  roundInfo: { allow: true }
};

var banned = {
  view: { allow: true },
  analyticsView: { allow: true },
  roundInfo: { allow: true }
};

var anonymous = {
  view: { allow: true },
  analyticsView: { allow: true },
  roundInfo: { allow: true }
};

var layout = {
  adTitle: { title: 'Ad Permissions', type: 'title' },
  create: { title: 'Create Ads' },
  duplicate: { title: 'Duplicate Ads' },
  edit: { title: 'Edit Ads' },
  remove: { title: 'Remove Ads' },
  view: { title: 'View a Single Ad' },

  analyticsSeparator: { type: 'separator' },
  analyticsTitle: { title: 'Analytics Permissions', type: 'title' },
  analyticsView: { title: 'View Analytics' },

  factoidSeparator: { type: 'separator' },
  factoidTitle: { title: 'Factoid Permissions', type: 'title' },
  factoidCreate: { title: 'Create Factoids' },
  factoidEdit: { title: 'Edit Factoids' },
  factoidEnable: { title: 'Enable Factoids' },
  factoidDisable: { title: 'Disable Factoids' },
  factoidRemove: { title: 'Remove Factoids' },

  roundSeparator: { type: 'separator' },
  roundTitle: { title: 'Round Permissions', type: 'title' },
  roundCreate: { title: 'Create Rounds' },
  roundInfo: { title: 'Round Information (Ad Info Page)'},
  roundRotate: { title: 'Rotate Rounds' },
  roundView: { title: 'View Round Information (Ad Managment)' },

  textSeparator: { type: 'separator' },
  textTitle: { title: 'Text Info Permissions', type: 'title' },
  textSave: { title: 'Update Text Information' }
};

module.exports = {
  validation: validation,
  layout: layout,
  defaults: {
    superAdministrator: superAdministrator,
    administrator: administrator,
    globalModerator: globalModerator,
    moderator: moderator,
    patroller: patroller,
    user: user,
    newbie: newbie,
    banned: banned,
    anonymous: anonymous,
    private: {}
  }
};
