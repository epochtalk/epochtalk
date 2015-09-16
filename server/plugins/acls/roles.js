var roles = {};
module.exports = roles;

// TODO: ensure that at least superAdmin, admin, moderator, user, banned, and anonymous roles are populated

/* base permission set
  roles.basePermissions = {
    // business logic
    name: 'superAdministrator',
    priority: 0,
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
      viewDeleted: {
        some: true,
        all: true
      },
      createInPrivateBoard: {
        some: true,
        all: true
      },
      createInUncategorizedBoard: {
        some: true,
        all: true
      },
      createInLockedThread: {
        some: true,
        all: true
      },
      updateInPrivateBoard: {
        some: true,
        all: true
      },
      updateInUncategorizedBoard: {
        some: true,
        all: true
      },
      updateInLockedThread: {
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
      update: {
        self: true,
        other: true,
      },
      find: true,
      deactivate: true,
      reactivate: true,
      delete: true
    }
  };
*/

// defaults
roles.superAdministrator = {
  // business logic
  name: 'superAdministrator',
  priority: 0,
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
    create: true,
    latest: true,
    findUser: true,
    delete: true
  },
  posts: {
    viewDeleted: {
      all: true
    },
    createInPrivateBoard: {
      all: true
    },
    createInUncategorizedBoard: {
      all: true
    },
    createInLockedThread: {
      all: true
    },
    updateInPrivateBoard: {
      all: true
    },
    updateInUncategorizedBoard: {
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
    update: {
      self: true,
      other: true,
    },
    find: true,
    deactivate: true,
    reactivate: true,
    delete: true
  }
};

roles.administrator = {
  // business logic
  name: 'administrator',
  priority: 1,
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
    create: true,
    latest: true,
    findUser: true,
    delete: true
  },
  posts: {
    viewDeleted: {
      all: true
    },
    createInPrivateBoard: {
      all: true
    },
    createInUncategorizedBoard: {
      all: true
    },
    createInLockedThread: {
      all: true
    },
    updateInPrivateBoard: {
      all: true
    },
    updateInUncategorizedBoard: {
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
    update: true,
    find: true,
    deactivate: true,
    reactivate: true,
    delete: true
  }
};

roles.globalModerator = {
  // business logic
  name: 'globalModerator',
  priority: 2,
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
    create: true,
    latest: true,
    findUser: true,
    delete: true
  },
  posts: {
    viewDeleted: {
      all: true
    },
    createInPrivateBoard: {
      all: true
    },
    createInUncategorizedBoard: {
      all: true
    },
    createInLockedThread: {
      all: true
    },
    updateInPrivateBoard: {
      all: true
    },
    updateInUncategorizedBoard: {
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
    update: true,
    find: true,
    deactivate: true,
    reactivate: true,
  }
};

roles.moderator = {
  // business logic
  name: 'moderator',
  priority: 3,
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
    viewDeleted: {
      some: true,
    },
    createInPrivateBoard: {
      some: true
    },
    createInUncategorizedBoard: {
      some: true
    },
    createInLockedThread: {
      some: true
    },
    updateInPrivateBoard: {
      some: true
    },
    updateInUncategorizedBoard: {
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
    update: true,
    find: true,
    deactivate: true,
    reactivate: true
  }
};

roles.user = {
  // business logic (none)
  name: 'user',
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
  name: 'banned',
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
  name: 'anonymous',
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
  name: 'private',
  priority: 7
  // ACLs none
};

// read from DB to replace defaults
