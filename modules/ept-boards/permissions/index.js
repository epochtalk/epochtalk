var Joi = require('joi');

var validation =  Joi.object().keys({
  allCategories: Joi.object().keys({
    allow: Joi.boolean()
  }),
  allUnfiltered: Joi.object().keys({
    allow: Joi.boolean()
  }),
  allUncategorized: Joi.object().keys({
    allow: Joi.boolean()
  }),
  create: Joi.object().keys({
    allow: Joi.boolean()
  }),
  delete: Joi.object().keys({
    allow: Joi.boolean()
  }),
  find: Joi.object().keys({
    allow: Joi.boolean()
  }),
  update: Joi.object().keys({
    allow: Joi.boolean()
  })
});

var superAdministrator = {
  allCategories: { allow: true },
  allUnfiltered: { allow: true },
  allUncategorized: { allow: true },
  create: { allow: true },
  delete: { allow: true },
  find: { allow: true },
  update: { allow: true }
};

var administrator = {
  allCategories: { allow: true },
  allUnfiltered: { allow: true },
  allUncategorized: { allow: true },
  create: { allow: true },
  delete: { allow: true },
  find: { allow: true },
  update: { allow: true }
};

var globalModerator = {
  allCategories: { allow: true },
  find: { allow: true }
};

var moderator = {
  allCategories: { allow: true },
  find: { allow: true }
};

var patroller = {
  allCategories: { allow: true },
  find: { allow: true }
};

var user = {
  allCategories: { allow: true },
  find: { allow: true }
};

var newbie = {
  allCategories: { allow: true },
  find: { allow: true }
};

var banned = {
  allCategories: { allow: true },
  find: { allow: true }
};

var anonymous = {
  allCategories: { allow: true },
  find: { allow: true }
};

var layout = {
  allCategories: { title: 'View Public Boards' },
  allUnfiltered: { title: 'Fetch all Boards in their respective categories, including private boards (For Board/Category Editing)' },
  allUncategorized: { title: 'Fetch all Boards, including uncategorized and private boards (For Board/Category Editing)' },
  create: { title: 'Create Boards' },
  delete: { title: 'Delete Boards' },
  find: { title: 'View Single Board' },
  update: { title: 'Update Boards' }
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
