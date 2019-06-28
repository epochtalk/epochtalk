var roles = {};
module.exports = roles;

/* base permission set
  roles.basePermissions = {
    // business logic
    id: '',
    name: 'Super Administrator',
    lookup: 'superAdministrator',
    description: 'This role has full moderation and settings access',
    highlightColor: '#FF0000',
    priority: 0,
    // View Access
    adminAccess: {
      settings: {
        general: true,
        advanced: true,
        theme: true
      },
      management: {
        boards: true,
        users: true,
        roles: true,
        bannedAddresses: true,
        invitations: true,
      }
    },
    modAccess: {
      users: true,
      posts: true,
      messages: true,
      boardBans: true,
      logs: true
    },
    // ACLs
    adminSettings: {
      find: true,
      update: true,
      getTheme: true,
      setTheme: true,
      resetTheme: true,
      previewTheme: true,
      getBlacklist: true,
      addToBlacklist: true,
      updateBlacklist: true,
      deleteFromBlacklist: true
    },
    bans: {
      privilegedBan: {
        samePriority: true,
        lowerPriority: true
      },
      privilegedBanFromBoards: {
        samePriority: true,
        lowerPriority: true
        all: true,
        some: true,
      },
      ban: true,
      unban: true,
      banFromBoards: true,
      unbanFromBoards: true,
      getBannedBoards: true,
      byBannedBoards: true,
      addAddresses: true,
      editAddress: true,
      deleteAddress: true,
      pageBannedAddresses: true
    },
    userNotes: {
      page: true,
      create: true,
      update: true,
      delete: true
    },
    limits: []
  };
*/

// defaults
roles.superAdministrator = {
  // business logic
  id: '8ab5ef49-c2ce-4421-9524-bb45f289d42c',
  name: 'Super Administrator',
  lookup: 'superAdministrator',
  description: 'Full moderation and settings access',
  highlightColor: '#ff7442',
  priority: 0,
  // View Access
  adminAccess: {
    settings: {
      general: true,
      advanced: true,
      legal: true,
      theme: true
    },
    management: {
      boards: true,
      users: true,
      roles: true,
      bannedAddresses: true,
      invitations: true
    }
  },
  modAccess: {
    users: true,
    posts: true,
    messages: true,
    boardBans: true,
    logs: true,
  },
  // ACLs
  adminBoards: {
    moveBoards: true,
    updateCategories: true
  },
  adminSettings: {
    find: true,
    update: true,
    getTheme: true,
    setTheme: true,
    resetTheme: true,
    previewTheme: true
  }
};

roles.administrator = {
  // business logic
  id: '06860e6f-9ac0-4c2a-8d9c-417343062fb8',
  name: 'Administrator',
  lookup: 'administrator',
  description: 'Full moderation and partial settings access',
  highlightColor: '#FF4C4C',
  priority: 1,
  // View Access
  adminAccess: {
    management: {
      boards: true,
      users: true,
      roles: true,
      bannedAddresses: true,
      invitations: true
    }
  },
  modAccess: {
    users: true,
    posts: true,
    messages: true,
    boardBans: true,
    logs: true
  },
  // ACLs
  adminBoards: {
    moveBoards: true,
    updateCategories: true
  }
};

roles.globalModerator = {
  // business logic
  id: 'fb0f70b7-3652-4f7d-a166-05ee68e7428d',
  name: 'Global Moderator',
  lookup: 'globalModerator',
  description: 'Full moderation access across all boards',
  highlightColor: '#32A56E',
  priority: 2,
  // View Access
  modAccess: {
    users: true,
    posts: true,
    messages: true,
    boardBans: true
  },
  // ACLs
  adminBoards: {
    moveBoards: true
  }
};

roles.moderator = {
  // business logic
  id: 'c0d39771-1541-4b71-9122-af0736cad23d',
  name: 'Moderator',
  lookup: 'moderator',
  description: 'Full moderation access to moderated boards',
  highlightColor: '#508DD0',
  priority: 3,
  // View Access
  modAccess: {
    users: true,
    posts: true,
    messages: true,
    boardBans: true
  },
  // ACLs
  adminBoards: {
    moveBoards: true
  }
};

roles.user = {
  // business logic (none)
  id: 'edcd8f77-ce34-4433-ba85-17f9b17a3b60',
  name: 'User',
  description: 'Standard account with access to create threads and post',
  lookup: 'user',
  priority: 4
};

roles.patroller = {
  // business logic (none)
  id: 'd62dc470-12f5-4093-a6c6-ef674985d5b6',
  name: 'Patroller',
  description: 'Moderates Newbies only, otherwise mirrors User role unless modified',
  lookup: 'patroller',
  priority: 5
};

roles.newbie = {
  // business logic (none)
  id: '08dd21e5-9781-4c6a-8c6f-3c1574c59a85',
  name: 'Newbie',
  description: 'Brand new users',
  lookup: 'newbie',
  priority: 6
};

roles.banned = {
  // business logic (none)
  id: '67aaa01e-cc74-4c3d-9b3f-56a6f6547098',
  name: 'Banned',
  lookup: 'banned',
  description: 'Read only access with content creation disabled',
  priority: 7,
  priorityRestrictions: [0, 1, 2, 3]
};

roles.anonymous = {
  // business logic (none)
  id: 'da3f52da-48c3-4487-859b-bbb2968503e1',
  name: 'Anonymous',
  lookup: 'anonymous',
  description: 'Read only access',
  priority: 8
};

roles.private = {
  // business logic (none)
  id: 'f3493216-2b39-41c7-8a5e-0475428d2af4',
  name: 'Private',
  lookup: 'private',
  description: 'Role assigned to unauthorized users when public forum is disabled',
  priority: 9
};

// read from DB to replace defaults
