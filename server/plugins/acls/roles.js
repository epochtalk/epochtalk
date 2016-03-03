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
        roles: true
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
      categories: true,
      boards: true,
      moveBoards: true,
      updateCategories: true
    },
    adminModerationLogs: {
      page: true
    },
    adminReports: {
      createUserReportNote: true,
      createPostReportNote: true,
      createMessageReportNote: true,
      updateUserReport: true,
      updatePostReport: true,
      updateMessageReport: true,
      updateUserReportNote: true,
      updatePostReportNote: true,
      updateMessageReportNote: true,
      pageUserReports: true,
      pagePostReports: true,
      pageMessageReports: true,
      pageUserReportsNotes: true,
      pagePostReportsNotes: true,
      pageMessageReportsNotes: true
    },
    adminRoles: {
      all: true,
      users: true,
      add: true,
      update: true,
      remove: true,
      reprioritize: true
    },
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
    adminUsers: {
      privilegedUpdate: {
        samePriority: true,
        lowerPriority: true
      },
      privilegedAddRoles: {
        samePriority: true,
        lowerPriority: true
      },
      privilegedRemoveRoles: {
        samePriority: true,
        lowerPriority: true
      },
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
      update: true,
      find: true,
      addRoles: true,
      removeRoles: true,
      searchUsernames: true,
      count: true,
      countAdmins: true,
      countModerators: true,
      page: true,
      pageAdmins: true,
      pageModerators: true,
      ban: true,
      unban: true,
      banFromBoards: true,
      unbanFromBoards: true,
      getBannedBoards: true,
      byBannedBoards: true
    },
    adminModerators: {
      add: true,
      remove: true
    },
    boards: {
      viewUncategorized: {
        some: true,
        all: true
      },
      create: true, // creating new boards
      find: true, // standard user permission
      allCategories: true, // all boards in categories
      update: true, // Update individual board
      delete: true // Removes individual boards
    },
    categories: {
      create: true, // Create a new categories
      find: true, // unused
      all: true, // unused
      delete: true // Removes a category
    },
    conversations: {
      create: true,
      messages: true,
      delete: true
    },
    messages: {
      privilegedDelete: true,
      create: true,
      latest: true,
      findUser: true,
      delete: true
    },
    // posts
    reports: {
      createUserReport: true,
      createPostReport: true,
      createMessageReport: true
    },
    threads: {
      privilegedTitle: {
        some: true,
        all: true
      },
      privilegedLock: {
        some: true,
        all: true
      },
      privilegedSticky: {
        some: true,
        all: true
      },
      privilegedMove: {
        some: true,
        all: true
      },
      privilegedPurge: {
        some: true,
        all: true
      },
      create: true,
      byBoard: true,
      posted: true,
      viewed: true,
      title: true,
      lock: true,
      sticky: true,
      move: true,
      moderated: true,
      purge: true
    },
    polls: {
      create: true,
      vote: true,
      lock: true,
      privilegedCreate: {
        some: true,
        all: true,
      }
    }
      privilegedLock: {
        some: true,
        all: true
      }
    },
    users: {
      privilegedDeactivate: {
        samePriority: true,
        lowerPriority: true
      },
      privilegedReactivate: {
        samePriority: true,
        lowerPriority: true
      },
      privilegedDelete: {
        samePriority: true,
        lowerPriority: true
      },
      viewDeleted: true,
      update: true,
      find: true,
      deactivate: true,
      reactivate: true,
      delete: true // do we need this?
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
      theme: true
    },
    management: {
      boards: true,
      users: true,
      roles: true
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
    categories: true,
    boards: true,
    moveBoards: true,
    updateCategories: true
  },
  adminModerationLogs: {
    page: true
  },
  adminReports: {
    createUserReportNote: true,
    createPostReportNote: true,
    createMessageReportNote: true,
    updateUserReport: true,
    updatePostReport: true,
    updateMessageReport: true,
    updateUserReportNote: true,
    updatePostReportNote: true,
    updateMessageReportNote: true,
    pageUserReports: true,
    pagePostReports: true,
    pageMessageReports: true,
    pageUserReportsNotes: true,
    pagePostReportsNotes: true,
    pageMessageReportsNotes: true
  },
  adminRoles: {
    all: true,
    users: true,
    add: true,
    update: true,
    remove: true,
    reprioritize: true
  },
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
  adminUsers: {
    privilegedUpdate: {
      samePriority: true
    },
    privilegedAddRoles: {
      samePriority: true
    },
    privilegedRemoveRoles: {
      samePriority: true
    },
    privilegedBan: {
      samePriority: true
    },
    privilegedBanFromBoards: {
      samePriority: true,
      all: true
    },
    update: true,
    find: true,
    addRoles: true,
    removeRoles: true,
    searchUsernames: true,
    count: true,
    countAdmins: true,
    countModerators: true,
    page: true,
    pageAdmins: true,
    pageModerators: true,
    ban: true,
    unban: true,
    banFromBoards: true,
    unbanFromBoards: true,
    getBannedBoards: true,
    byBannedBoards: true
  },
  adminModerators: {
    add: true,
    remove: true
  },
  boards: {
    viewUncategorized: {
      all: true
    },
    create: true,
    find: true,
    allCategories: true,
    update: true,
    delete: true
  },
  categories: {
    create: true,
    find: true,
    all: true,
    delete: true
  },
  conversations: {
    create: true,
    messages: true,
    delete: true
  },
  messages: {
    privilegedDelete: true,
    create: true,
    latest: true,
    findUser: true,
    delete: true
  },
  // posts
  reports: {
    createUserReport: true,
    createPostReport: true,
    createMessageReport: true
  },
  threads: {
    privilegedTitle: {
      all: true
    },
    privilegedLock: {
      all: true
    },
    privilegedSticky: {
      all: true
    },
    privilegedMove: {
      all: true
    },
    privilegedPurge: {
      all: true
    },
    create: true,
    byBoard: true,
    posted: true,
    viewed: true,
    title: true,
    lock: true,
    sticky: true,
    move: true,
    moderated: true,
    purge: true
  },
  polls: {
    create: true,
    vote: true,
    lock: true,
    privilegedCreate: { all: true },
    privilegedLock: { all: true }
  },
  users: {
    privilegedDeactivate: {
      lowerPriority: true
    },
    privilegedReactivate: {
      lowerPriority: true
    },
    privilegedDelete: {
      lowerPriority: true
    },
    viewDeleted: true,
    update: true,
    find: true,
    deactivate: true,
    reactivate: true,
    delete: true
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
      roles: true
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
    categories: true,
    boards: true,
    moveBoards: true,
    updateCategories: true
  },
  adminModerationLogs: {
    page: true
  },
  adminReports: {
    createUserReportNote: true,
    createPostReportNote: true,
    createMessageReportNote: true,
    updateUserReport: true,
    updatePostReport: true,
    updateMessageReport: true,
    updateUserReportNote: true,
    updatePostReportNote: true,
    updateMessageReportNote: true,
    pageUserReports: true,
    pagePostReports: true,
    pageMessageReports: true,
    pageUserReportsNotes: true,
    pagePostReportsNotes: true,
    pageMessageReportsNotes: true
  },
  adminRoles: {
    all: true,
    users: true,
  },
  adminUsers: {
    privilegedUpdate: {
      lowerPriority: true
    },
    privilegedAddRoles: {
      lowerPriority: true
    },
    privilegedRemoveRoles: {
      lowerPriority: true
    },
    privilegedBan: {
      lowerPriority: true
    },
    privilegedBanFromBoards: {
      lowerPriority: true,
      all: true
    },
    update: true,
    find: true,
    addRoles: true,
    removeRoles: true,
    searchUsernames: true,
    count: true,
    countAdmins: true,
    countModerators: true,
    page: true,
    pageAdmins: true,
    pageModerators: true,
    ban: true,
    unban: true,
    banFromBoards: true,
    unbanFromBoards: true,
    getBannedBoards: true,
    byBannedBoards: true
  },
  adminModerators: {
    add: true,
    remove: true
  },
  boards: {
    viewUncategorized: {
      all: true
    },
    create: true,
    find: true,
    allCategories: true,
    update: true,
    delete: true
  },
  categories: {
    create: true,
    find: true,
    all: true,
    delete: true
  },
  conversations: {
    create: true,
    messages: true,
    delete: true
  },
  messages: {
    privilegedDelete: true,
    create: true,
    latest: true,
    findUser: true,
    delete: true
  },
  // posts
  reports: {
    createUserReport: true,
    createPostReport: true,
    createMessageReport: true
  },
  threads: {
    privilegedTitle: {
      all: true
    },
    privilegedLock: {
      all: true
    },
    privilegedSticky: {
      all: true
    },
    privilegedMove: {
      all: true
    },
    privilegedPurge: {
      all: true
    },
    create: true,
    byBoard: true,
    posted: true,
    viewed: true,
    title: true,
    lock: true,
    sticky: true,
    move: true,
    moderated: true,
    purge: true
  },
  polls: {
    create: true,
    vote: true,
    lock: true,
    privilegedCreate: { all: true },
    privilegedLock: { all: true }
  },
  users: {
    privilegedDeactivate: {
      lowerPriority: true
    },
    privilegedReactivate: {
      lowerPriority: true
    },
    privilegedDelete: {
      lowerPriority: true
    },
    viewDeleted: true,
    update: true,
    find: true,
    deactivate: true,
    reactivate: true,
    delete: true
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
  },
  adminReports: {
    createUserReportNote: true,
    createPostReportNote: true,
    createMessageReportNote: true,
    updateUserReport: true,
    updatePostReport: true,
    updateMessageReport: true,
    updateUserReportNote: true,
    updatePostReportNote: true,
    updateMessageReportNote: true,
    pageUserReports: true,
    pagePostReports: true,
    pageMessageReports: true,
    pageUserReportsNotes: true,
    pagePostReportsNotes: true,
    pageMessageReportsNotes: true
  },
  adminUsers: {
    privilegedUpdate: {
      lowerPriority: true
    },
    privilegedBan: {
      lowerPriority: true
    },
    privilegedBanFromBoards : {
      lowerPriority: true,
      all: true
    },
    update: true,
    find: true,
    searchUsernames: true,
    ban: true,
    unban: true,
    banFromBoards: true,
    unbanFromBoards: true,
    getBannedBoards: true,
    byBannedBoards: true
  },
  boards: {
    viewUncategorized: {
      all: true
    },
    find: true,
    allCategories: true,
  },
  conversations: {
    create: true,
    messages: true
  },
  messages: {
    privilegedDelete: true,
    create: true,
    latest: true,
    findUser: true,
    delete: true
  },
  // posts
  reports: {
    createUserReport: true,
    createPostReport: true,
    createMessageReport: true
  },
  threads: {
    privilegedTitle: {
      all: true
    },
    privilegedLock: {
      all: true
    },
    privilegedSticky: {
      all: true
    },
    privilegedMove: {
      all: true
    },
    privilegedPurge: {
      all: true
    },
    create: true,
    byBoard: true,
    posted: true,
    viewed: true,
    title: true,
    lock: true,
    sticky: true,
    move: true,
    moderated: true,
    purge: true
  },
  polls: {
    create: true,
    vote: true,
    lock: true,
    privilegedCreate: { all: true },
    privilegedLock: { all: true }
  },
  users: {
    viewDeleted: true,
    update: true,
    find: true,
    deactivate: true,
    reactivate: true,
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
  },
  adminReports: {
    createUserReportNote: true,
    createPostReportNote: true,
    createMessageReportNote: true,
    updateUserReport: true,
    updatePostReport: true,
    updateMessageReport: true,
    updateUserReportNote: true,
    updatePostReportNote: true,
    updateMessageReportNote: true,
    pageUserReports: true,
    pagePostReports: true,
    pageMessageReports: true,
    pageUserReportsNotes: true,
    pagePostReportsNotes: true,
    pageMessageReportsNotes: true
  },
  adminUsers: {
    privilegedUpdate: {
      lowerPriority: true
    },
    privilegedBanFromBoards: {
      lowerPriority: true,
      some: true
    },
    update: true,
    find: true,
    searchUsernames: true,
    banFromBoards: true,
    unbanFromBoards: true,
    getBannedBoards: true,
    byBannedBoards: true
  },
  boards: {
    viewUncategorized: {
      some: true
    },
    find: true,
    allCategories: true
  },
  conversations: {
    create: true,
    messages: true
  },
  messages: {
    privilegedDelete: true,
    create: true,
    latest: true,
    findUser: true,
    delete: true
  },
  // posts
  reports: {
    createUserReport: true,
    createPostReport: true,
    createMessageReport: true
  },
  threads: {
    privilegedTitle: {
      some: true
    },
    privilegedLock: {
      some: true
    },
    privilegedSticky: {
      some: true
    },
    privilegedMove: {
      some: true
    },
    privilegedPurge: {
      some: true
    },
    create: true,
    byBoard: true,
    posted: true,
    viewed: true,
    title: true,
    lock: true,
    sticky: true,
    move: true,
    moderated: true,
    purge: true
  },
  polls: {
    create: true,
    vote: true,
    lock: true,
    privilegedCreate: { some: true },
    privilegedLock: { some: true }
  },
  users: {
    viewDeleted: true,
    update: true,
    find: true,
    deactivate: true,
    reactivate: true
  }
};

roles.user = {
  // business logic (none)
  id: 'edcd8f77-ce34-4433-ba85-17f9b17a3b60',
  name: 'User',
  description: 'Standard account with access to create threads and post',
  lookup: 'user',
  priority: 4,
  // ACLs
  boards: {
    find: true,
    allCategories: true
  },
  conversations: {
    create: true,
    messages: true
  },
  messages: {
    create: true,
    latest: true,
    findUser: true,
    delete: true
  },
  // posts
  reports: {
    createUserReport: true,
    createPostReport: true,
    createMessageReport: true
  },
  threads: {
    create: true,
    byBoard: true,
    posted: true,
    viewed: true,
    title: true,
    moderated: true,
    lock: true
  },
  polls: {
    create: true,
    vote: true,
    lock: true
  },
  users: {
    update: true,
    find: true,
    deactivate: true,
    reactivate: true
  }
};

roles.banned = {
  // business logic (none)
  id: '67aaa01e-cc74-4c3d-9b3f-56a6f6547098',
  name: 'Banned',
  lookup: 'banned',
  description: 'Read only access with content creation disabled',
  priority: 5,
  priorityRestrictions: [0, 1, 2, 3],
  // ACLs
  boards: {
    find: true,
    allCategories: true
  },
  conversations: {
    create: true,
    messages: true
  },
  messages: {
    create: true,
    latest: true,
    findUser: true
  },
  // posts
  threads: {
    byBoard: true,
    viewed: true
  },
  users: {
    find: true
  }
};

roles.anonymous = {
  // business logic (none)
  id: 'da3f52da-48c3-4487-859b-bbb2968503e1',
  name: 'Anonymous',
  lookup: 'anonymous',
  description: 'Read only access',
  priority: 6,
  // ACLs
  boards: {
    find: true,
    allCategories: true
  },
  // posts
  threads: {
    byBoard: true,
    viewed: true
  },
  users: {
    find: true
  }
};

roles.private = {
  // business logic (none)
  id: 'f3493216-2b39-41c7-8a5e-0475428d2af4',
  name: 'Private',
  lookup: 'private',
  description: 'Role assigned to unauthorized users when public forum is disabled',
  priority: 7
  // ACLs none
};

// read from DB to replace defaults
