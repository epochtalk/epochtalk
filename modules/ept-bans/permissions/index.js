var Joi = require('joi');

var allPermissions = {
  addAddresses: { allow: true },
  ban: {
    allow: true,
    bypass: {
      priority: { same: true }
    }
  },
  banFromBoards: {
    allow: true,
    bypass: {
      priority: { same: true },
      type: { admin: true }
    }
  },
  byBannedBoards: { allow: true},
  deleteAddress: { allow: true },
  editAddress: { allow: true },
  getBannedBoards: { allow: true },
  pageBannedAddresses: { allow: true }
};

var adminPermissions = {
  addAddresses: { allow: true },
  ban: {
    allow: true,
    bypass: {
      priority: { less: true }
    }
  },
  banFromBoards: {
    allow: true,
    bypass: {
      priority: { less: true },
      type: { admin: true }
    }
  },
  byBannedBoards: { allow: true},
  deleteAddress: { allow: true },
  editAddress: { allow: true },
  getBannedBoards: { allow: true },
  pageBannedAddresses: { allow: true }
};

var globalModPermissions = {
  ban: {
    allow: true,
    bypass: {
      priority: { less: true }
    }
  },
  banFromBoards: {
    allow: true,
    bypass: {
      priority: { less: true },
      type: { admin: true }
    }
  }
};

var modPermissions = {
  banFromBoards: {
    allow: true,
    bypass: {
      priority: { less: true },
      type: { mod: true }
    }
  }
};

var noPermissions = {};

module.exports = [{
  name: 'bans',
  data: {
  validation: Joi.object().keys({
      addAddresses: Joi.object().keys({
        allow: Joi.boolean()
      }),
      ban: Joi.object().keys({
        allow: Joi.boolean(),
        bypass: Joi.object().keys({
          priority: Joi.object().keys({
            same: Joi.boolean(),
            less: Joi.boolean()
          }).xor('admin', 'mod')
        })
      }),
      banFromBoards: Joi.object().keys({
        allow: Joi.boolean(),
        bypass: Joi.object().keys({
          priority: Joi.object().keys({
            same: Joi.boolean(),
            less: Joi.boolean()
          }).xor('same', 'less'),
          type: Joi.object().keys({
            admin: Joi.boolean(),
            mod: Joi.boolean()
          }).xor('admin', 'mod')
        })
      }),
      byBannedBoards: Joi.object().keys({
        allow: Joi.boolean()
      }),
      deleteAddress: Joi.object().keys({
        allow: Joi.boolean()
      }),
      editAddress: Joi.object().keys({
        allow: Joi.boolean()
      }),
      getBannedBoards: Joi.object().keys({
        allow: Joi.boolean()
      }),
      pageBannedAddresses: Joi.object().keys({
        allow: Joi.boolean()
      })
    }),

    layout: {
      all: { title: 'Allow user to query a list of all the bans (Admin only recommended)' },
      users: { title: 'Allow user to query a list of all users within a role (Admin only recommended)' },
      add: { title: 'Allows user to create new bans (Admin only recommended)' },
      update: { title: 'Allow user to update existing bans (Admin only recommended)' },
      remove: { title: 'Allow user to delete non-default bans (Admin only recommended)' },
      reprioritize: { title: 'Allow user to reprioritize bans (Admin only recommended)' },
    },

    defaults: {
      superAdministrator: allPermissions,
      administrator: adminPermissions,
      globalModerator: globalModPermissions,
      moderator: modPermissions,
      patroller: noPermissions,
      user: noPermissions,
      newbie: noPermissions,
      banned: noPermissions,
      anonymous: noPermissions,
      private: noPermissions
    }
  }
}];
