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
        forum: true
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
      messages: true
    },
    // ACLs
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
      pageMessageReportsNotes: true,
      userReportsCount: true,
      postReportsCount: true,
      messageReportsCount: true,
      userReportsNotesCount: true,
      postReportsNotesCount: true,
      messageReportsNotesCount: true
    },
    adminSettings: {
      find: true,
      update: true
    },
    adminUsers: {
      privilegedUpdate: {
        samePriority: true,
        lowerPriority: true
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
      unban: true
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
      create: true,
      find: true,
      all: true,
      allCategories: true,
      updateCategories: true,
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
      create: true,
      latest: true,
      findUser: true,
      delete: true
    },
    posts: {
      privilegedUpdate: {
        some: true,
        all: true
      },
      privilegedDelete: {
        some: true,
        all: true
      },
      privilegedPurge: {
        some: true,
        all: true
      },
      viewDeleted: {
        some: true,
        all: true
      },
      bypassLock: {
        some: true,
        all: true
      },
      create: true,
      find: true,
      byThread: true,
      update: true,
      delete: true,
      undelete: true,
      purge: true,
      pageByUser: true
    },
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
      viewed: true,
      title: true,
      lock: true,
      sticky: true,
      move: true,
      purge: true
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
    }
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
      forum: true
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
    messages: true
  },
  // ACLs
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
    pageMessageReportsNotes: true,
    userReportsCount: true,
    postReportsCount: true,
    messageReportsCount: true,
    userReportsNotesCount: true,
    postReportsNotesCount: true,
    messageReportsNotesCount: true
  },
  adminSettings: {
    find: true,
    update: true
  },
  adminUsers: {
    privilegedUpdate: {
      lowerPriority: true
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
    unban: true
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
    all: true,
    allCategories: true,
    updateCategories: true,
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
  posts: {
    privilegedUpdate: {
      all: true
    },
    privilegedDelete: {
      all: true
    },
    privilegedPurge: {
      all: true
    },
    viewDeleted: {
      all: true
    },
    bypassLock: {
      all: true
    },
    create: true,
    find: true,
    byThread: true,
    update: true,
    delete: true,
    undelete: true,
    purge: true,
    pageByUser: true
  },
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
    viewed: true,
    title: true,
    lock: true,
    sticky: true,
    move: true,
    delete: true
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
    messages: true
  },
  // ACLs
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
    pageMessageReportsNotes: true,
    userReportsCount: true,
    postReportsCount: true,
    messageReportsCount: true,
    userReportsNotesCount: true,
    postReportsNotesCount: true,
    messageReportsNotesCount: true
  },
  adminSettings: {
    find: true,
    update: true
  },
  adminUsers: {
    privilegedUpdate: {
      lowerPriority: true
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
    unban: true
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
    all: true,
    allCategories: true,
    updateCategories: true,
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
  posts: {
    privilegedUpdate: {
      all: true
    },
    privilegedDelete: {
      all: true
    },
    privilegedPurge: {
      all: true
    },
    viewDeleted: {
      all: true
    },
    bypassLock: {
      all: true
    },
    create: true,
    find: true,
    byThread: true,
    update: true,
    delete: true,
    undelete: true,
    purge: true,
    pageByUser: true
  },
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
    viewed: true,
    title: true,
    lock: true,
    sticky: true,
    move: true,
    purge: true
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
    messages: true
  },
  // ACLs
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
    pageMessageReportsNotes: true,
    userReportsCount: true,
    postReportsCount: true,
    messageReportsCount: true,
    userReportsNotesCount: true,
    postReportsNotesCount: true,
    messageReportsNotesCount: true
  },
  adminUsers: {
    privilegedUpdate: {
      lowerPriority: true
    },
    update: true,
    find: true,
    ban: true,
    unban: true
  },
  boards: {
    viewUncategorized: {
      all: true
    },
    find: true,
    all: true,
    allCategories: true,
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
  posts: {
    privilegedUpdate: {
      all: true
    },
    privilegedDelete: {
      all: true
    },
    privilegedPurge: {
      all: true
    },
    viewDeleted: {
      all: true
    },
    bypassLock: {
      all: true
    },
    create: true,
    find: true,
    byThread: true,
    update: true,
    delete: true,
    undelete: true,
    purge: true,
    pageByUser: true
  },
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
    viewed: true,
    title: true,
    lock: true,
    sticky: true,
    move: true,
    purge: true
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
    messages: true
  },
  // ACLs
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
    pageMessageReportsNotes: true,
    userReportsCount: true,
    postReportsCount: true,
    messageReportsCount: true,
    userReportsNotesCount: true,
    postReportsNotesCount: true,
    messageReportsNotesCount: true
  },
  adminUsers: {
    privilegedUpdate: {
      lowerPriority: true
    },
    update: true,
    find: true,
    ban: true,
    unban: true
  },
  boards: {
    viewUncategorized: {
      some: true
    },
    find: true,
    all: true,
    allCategories: true
  },
  conversations: {
    create: true,
    messages: true,
    delete: true
  },
  messages: {
    create: true,
    latest: true,
    findUser: true,
    delete: true
  },
  posts: {
    privilegedUpdate: {
      some: true
    },
    privilegedDelete: {
      some: true
    },
    privilegedPurge: {
      some: true
    },
    viewDeleted: {
      some: true,
    },
    bypassLock: {
      some: true
    },
    create: true,
    find: true,
    byThread: true,
    update: true,
    delete: true,
    undelete: true,
    purge: true,
    pageByUser: true
  },
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
    viewed: true,
    title: true,
    lock: true,
    sticky: true,
    move: true,
    purge: true
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
    messages: true,
    delete: true
  },
  messages: {
    create: true,
    latest: true,
    findUser: true,
    delete: true
  },
  posts: {
    create: true,
    find: true,
    byThread: true,
    update: true,
    delete: true,
    undelete: true,
    pageByUser: true
  },
  reports: {
    createUserReport: true,
    createPostReport: true,
    createMessageReport: true
  },
  threads: {
    create: true,
    byBoard: true,
    viewed: true,
    title: true,
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
  name: 'Banned',
  lookup: 'banned',
  description: 'Read only access with content creation disabled',
  priority: 5,
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
  posts: {
    find: true,
    byThread: true,
    pageByUser: true
  },
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
  name: 'Anonymous',
  lookup: 'anonymous',
  description: 'Read only access',
  priority: 6,
  // ACLs
  boards: {
    find: true,
    allCategories: true
  },
  posts: {
    find: true,
    byThread: true,
    pageByUser: true
  },
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
  name: 'Private',
  lookup: 'private',
  description: 'Role assigned to unauthorized users when public forum is disabled',
  priority: 7
  // ACLs none
};

// read from DB to replace defaults
