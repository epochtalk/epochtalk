var Joi = require('@hapi/joi');

var validation =  Joi.object().keys({
  update: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      priority: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean()
      }).xor('admin', 'mod')
    })
  }),
  changeUsername:  Joi.object().keys({
    allow: Joi.boolean()
  }),
  find: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      viewDeleted: Joi.boolean(),
      viewMoreInfo: Joi.boolean()
    })
  }),
  lookup: Joi.object().keys({
    allow: Joi.boolean()
  }),
  deactivate: Joi.object().keys({
    allow: Joi.boolean()
  }),
  reactivate: Joi.object().keys({
    allow: Joi.boolean()
  }),
  delete: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      priority: Joi.object().keys({
        admin: Joi.boolean(),
        mod: Joi.boolean()
      }).xor('admin', 'mod')
    })
  }),
  pagePublic: Joi.object().keys({
    allow: Joi.boolean()
  }),
  adminRecover: Joi.object().keys({
    allow: Joi.boolean()
  }),
  adminPage: Joi.object().keys({
    allow: Joi.boolean()
  }),
  searchUsernames: Joi.object().keys({
    allow: Joi.boolean()
  }),
  addRoles: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      priority: Joi.object().keys({
        same: Joi.boolean(),
        less: Joi.boolean()
      }).xor('same', 'less')
    })
  }),
  removeRole: Joi.object().keys({
    allow: Joi.boolean(),
    bypass: Joi.object().keys({
      priority: Joi.object().keys({
        same: Joi.boolean(),
        less: Joi.boolean()
      }).xor('same', 'less')
    })
  })
});

var superAdministrator = {
  update: {
    allow: true,
    bypass: { priority: { admin: true } }
  },
  changeUsername: { allow: true },
  find: {
    allow: true,
    bypass: {
      viewDeleted: true,
      viewMoreInfo: true
    }
  },
  lookup: { allow: true},
  deactivate: { allow: true },
  reactivate: { allow: true },
  delete: {
    allow: true,
    bypass: { priority: { admin: true } }
  },
  pagePublic: { allow: true },
  adminRecover: { allow: true },
  adminPage: { allow: true },
  searchUsernames: { allow: true },
  addRoles: {
    allow: true,
    bypass: {
      priority: { same: true }
    }
  },
  removeRole: {
    allow: true,
    bypass: {
      priority: { same: true }
    }
  }
};

var administrator = {
  update: {
    allow: true,
    bypass: { priority: { admin: true } }
  },
  changeUsername: { allow: true },
  find: {
    allow: true,
    bypass: {
      viewDeleted: true,
      viewMoreInfo: true
    }
  },
  lookup: { allow: true},
  deactivate: { allow: true },
  reactivate: { allow: true },
  delete: {
    allow: true,
    bypass: { priority: { admin: true } }
  },
  pagePublic: { allow: true },
  adminRecover: { allow: true },
  adminPage: { allow: true },
  searchUsernames: { allow: true },
  addRoles: {
    allow: true,
    bypass: {
      priority: { less: true }
    }
  },
  removeRole: {
    allow: true,
    bypass: {
      priority: { less: true }
    }
  }
};

var globalModerator = {
  update: {
    allow: true,
    bypass: { priority: { mod: true } }
  },
  changeUsername: { allow: true },
  find: {
    allow: true,
    bypass: {
      viewDeleted: true,
      viewMoreInfo: true
    }
  },
  lookup: { allow: true},
  deactivate: { allow: true },
  reactivate: { allow: true },
  delete: {
    allow: true,
    bypass: { priority: { mod: true } }
  },
  pagePublic: { allow: true },
  searchUsernames: { allow: true }
};

var moderator = {
  update: {
    allow: true,
    bypass: { priority: { mod: true } }
  },
  changeUsername: { allow: true },
  find: {
    allow: true,
    bypass: {
      viewDeleted: true,
      viewMoreInfo: true
    }
  },
  lookup: { allow: true},
  deactivate: { allow: true },
  reactivate: { allow: true },
  delete: {
    allow: true,
    bypass: { priority: { mod: true } }
  },
  pagePublic: { allow: true },
  searchUsernames: { allow: true }
};

var patroller = {
  update: { allow: true },
  find: { allow: true },
  lookup: { allow: true},
  deactivate: { allow: true },
  reactivate: { allow: true },
  pagePublic: { allow: true }
};

var user = {
  update: { allow: true },
  find: { allow: true },
  lookup: { allow: true},
  deactivate: { allow: true },
  reactivate: { allow: true },
  pagePublic: { allow: true }
};

var newbie = {
  update: { allow: true },
  find: { allow: true },
  lookup: { allow: true},
  deactivate: { allow: true },
  reactivate: { allow: true },
  pagePublic: { allow: true }
};

var banned = {
  find: { allow: true },
  lookup: { allow: true}
};

var anonymous = {
  find: { allow: true },
  lookup: { allow: true}
};

var layout = {
  update: {
    title: 'Update User Accounts',
    bypasses: [ {
      description: 'Other Users', control: 'priority' } ]
  },
  changeUsername: { title: 'Change username' },
  find: {
    title: 'View User Accounts',
    bypasses: [
      { description: 'View Deactivated Accounts', control: 'viewDeleted', type: 'boolean' },
      { description: 'View Sensitive Information', control: 'viewMoreInfo', type: 'boolean'}
    ]
  },
  lookup: { title: 'Allow user to lookup usernames (Used for messaging and other UI components)' },
  pagePublic: { title: 'Search and Page forum members' },
  deactivate: { title: 'Deactivate Their Account' },
  reactivate: { title: 'Reactivate Their Account' },
  delete: {
    title: 'Delete User Accounts',
    bypasses: [ { description: 'Other Users', control: 'priority' } ]
  },
  adminRecover: { title: 'Send password recovery email to other user\'s accounts' },
  priviledgedUserSeparator: { type: 'separator' },
  priviledgedUserTitle: { title: 'Priviledged User Permissions', type: 'title' },
  addRoles: {
    title: 'Allow user to add roles to other\'s user accounts',
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
  removeRole: {
    title: 'Allow user to remove roles from other\'s user accounts',
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
  searchUsernames: { title: 'Search all usernames, used for admin/mod UI components to lookup users' },
  adminPage: { title: 'Page through all forum users, used for admin/mod' }
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
