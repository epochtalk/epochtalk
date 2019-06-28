var Joi = require('joi');

var validation =  Joi.object().keys({
  addTrustBoard: Joi.object().keys({
    allow: Joi.boolean()
  }),
  addTrustFeedback: Joi.object().keys({
    allow: Joi.boolean()
  }),
  deleteTrustBoard: Joi.object().keys({
    allow: Joi.boolean()
  }),
  editDefaultTrustList: Joi.object().keys({
    allow: Joi.boolean()
  }),
  getDefaultTrustList: Joi.object().keys({
    allow: Joi.boolean()
  })
});

var superAdministrator = {
  addTrustBoard: { allow: true },
  deleteTrustBoard: { allow: true },
  editDefaultTrustList: { allow: true },
  getDefaultTrustList: { allow: true },
  addTrustFeedback: { allow: true }
};

var administrator = {
  addTrustFeedback: { allow: true }
};

var globalModerator = {
  addTrustFeedback: { allow: true }
};

var moderator = {
  addTrustFeedback: { allow: true }
};

var patroller = {
  addTrustFeedback: { allow: true }
};

var user = {
  addTrustFeedback: { allow: true }
};

var newbie = {
  addTrustFeedback: { allow: true }
};

var layout = {
  generalTitle: { title: 'Standard Permissions', type: 'title' },
  addTrustFeedback: { title: 'Allow user to leave trust feedback for another user' },

  postSeparator: { type: 'separator' },
  adminTitle: { title: 'Elevated Permissions', type: 'title' },
  addTrustBoard: { title: 'Allow user to enable trust score for a specific board' },
  deleteTrustBoard: { title: 'Allow user to disable trust score for a specific board' },
  editDefaultTrustList: { title: 'Allow user to edit DefaultTrust account\'s trust list' },
  getDefaultTrustList: { title: 'Allow user to retrieve DefaultTrust account\'s trust list' },
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
    banned: {},
    anonymous: {},
    private: {}
  }
};
