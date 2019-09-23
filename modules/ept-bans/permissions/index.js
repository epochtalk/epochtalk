var Joi = require('@hapi/joi');

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
          }).xor('same', 'less')
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
      pageBannedAddresses: Joi.object().keys({
        allow: Joi.boolean()
      })
    }),

    layout: {
      banTitle: { title: 'User Ban Permissions', type: 'title' },
      ban: {
        title: 'Allow user to ban/unban other\'s accounts',
        bypasses: [
          {
            descriptions: [
              'Users with the same or lesser role',
              'Only users with lesser roles'
            ],
            values: [
              'same',
              'less'
            ],
            defaultValue: 'less',
            control: 'priority',
            type: 'radio'
          }
        ]
      },
      banFromBoards: {
        title: 'Allow user to ban/unban other\'s accounts from certain boards',
        bypasses: [
          {
            descriptions: [
              'Users with the same or lesser role',
              'Only users with lesser roles'
            ],
            values: [
              'same',
              'less'
            ],
            defaultValue: 'less',
            control: 'priority',
            type: 'radio'
          },
          {
            descriptions: [
              'Ban/unban users from any board',
              'Ban/unban users from boards this user moderates'
            ],
            defaultValue: 'mod',
            values: [
              'admin',
              'mod'
            ],
            control: 'type',
            type: 'radio'
          }
        ]
      },
      byBannedBoards: { title: 'Allow user to page through a list of board banned users, used for board bans moderation page' },
      banAddressSeparator: { type: 'separator' },
      banAddressTitle: { title: 'IP/Host Ban Permissions', type: 'title' },
      addAddresses: { title: 'Allow user to manually ban addresses, used for admin banned addresses page' },
      deleteAddress: { title: 'Allow user to delete banned addresses, used for admin banned addresses page' },
      editAddress: { title: 'Allow user to edit banned addresses. used for admin banned addresses page' },
      pageBannedAddresses: { title: 'Allow user to page through banned addresses, used for admin banned addresses page' }
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
