var roles = {};
module.exports = roles;

// TODO: ensure that at least superAdmin, admin, moderator, user, banned, and anonymous roles are populated

// defaults
roles.superAdmin = {
  // business logic
  name: 'superAdmin',
  superAdmin: true,
  admin: true,
  globalModerator: true,
  moderator: true,
  // ACLs
  adminReports: {
    createUserReportNote: true,
    createPostRepostNote: true,
    createMessageReportNote: true,
    updateUserReport: true,
    updatePostReport: true,
    updateMessageReport: true,
    updateUserReportNote: true,
    updatePostReportNote: true,
    updateMessageReportNote: true,
    pageUserReports: true,
    pagePostReports: true,
    pageMessageReport: true,
    pageUserReportsNotes: true,
    pagePostReportsNotes: true,
    pageMessageReportsNotes: true,
    userReportCount: true,
    postReportCount: true,
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
    searchUsername: true,
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

roles.admin = {
  // business logic
  name: 'admin',
  admin: true,
  globalModerator: true,
  moderator: true,
  // ACLs
  adminReports: {
    createUserReportNote: true,
    createPostRepostNote: true,
    createMessageReportNote: true,
    updateUserReport: true,
    updatePostReport: true,
    updateMessageReport: true,
    updateUserReportNote: true,
    updatePostReportNote: true,
    updateMessageReportNote: true,
    pageUserReports: true,
    pagePostReports: true,
    pageMessageReport: true,
    pageUserReportsNotes: true,
    pagePostReportsNotes: true,
    pageMessageReportsNotes: true,
    userReportCount: true,
    postReportCount: true,
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
    searchUsername: true,
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
  globalModerator: true,
  moderator: true,
  // ACLs
  adminReports: {
    createUserReportNote: true,
    createPostRepostNote: true,
    createMessageReportNote: true,
    updateUserReport: true,
    updatePostReport: true,
    updateMessageReport: true,
    updateUserReportNote: true,
    updatePostReportNote: true,
    updateMessageReportNote: true,
    pageUserReports: true,
    pagePostReports: true,
    pageMessageReport: true,
    pageUserReportsNotes: true,
    pagePostReportsNotes: true,
    pageMessageReportsNotes: true,
    userReportCount: true,
    postReportCount: true,
    messageReportsCount: true,
    userReportsNotesCount: true,
    postReportsNotesCount: true,
    messageReportsNotesCount: true
  },
  adminSettings: {
    find: false,
    update: false
  },
  adminUsers: {
    update: true,
    find: true,
    addRoles: false,
    removeRoles: false,
    searchUsername: false,
    count: false,
    countAdmins: false,
    countModerators: false,
    page: false,
    pageAdmins: false,
    pageModerators: false,
    ban: true,
    unban: true
  },
  boards: {
    create: false,
    find: true,
    all: true,
    allCategories: true,
    updateCategories: false,
    update: false,
    delete: false
  },
  categories: {
    create: false,
    find: false,
    all: false,
    delete: false
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
    delete: false
  }
};

roles.moderator = {
  // business logic
  name: 'moderator',
  moderator: true,
  // ACLs
  adminReports: {
    createUserReportNote: true,
    createPostRepostNote: true,
    createMessageReportNote: true,
    updateUserReport: true,
    updatePostReport: true,
    updateMessageReport: true,
    updateUserReportNote: true,
    updatePostReportNote: true,
    updateMessageReportNote: true,
    pageUserReports: true,
    pagePostReports: true,
    pageMessageReport: true,
    pageUserReportsNotes: true,
    pagePostReportsNotes: true,
    pageMessageReportsNotes: true,
    userReportCount: true,
    postReportCount: true,
    messageReportsCount: true,
    userReportsNotesCount: true,
    postReportsNotesCount: true,
    messageReportsNotesCount: true
  },
  adminSettings: {
    find: false,
    update: false
  },
  adminUsers: {
    update: true,
    find: true,
    addRoles: false,
    removeRoles: false,
    searchUsername: false,
    count: false,
    countAdmins: false,
    countModerators: false,
    page: false,
    pageAdmins: false,
    pageModerators: false,
    ban: true,
    unban: true
  },
  boards: {
    create: false,
    find: true,
    all: true,
    allCategories: true,
    updateCategories: false,
    update: false,
    delete: false
  },
  categories: {
    create: false,
    find: false,
    all: false,
    delete: false
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
    delete: false
  }
};

roles.user = {
  // business logic (none)
  name: 'user',
  // ACLs
  adminReports: {
    createUserReportNote: false,
    createPostRepostNote: false,
    createMessageReportNote: false,
    updateUserReport: false,
    updatePostReport: false,
    updateMessageReport: false,
    updateUserReportNote: false,
    updatePostReportNote: false,
    updateMessageReportNote: false,
    pageUserReports: false,
    pagePostReports: false,
    pageMessageReport: false,
    pageUserReportsNotes: false,
    pagePostReportsNotes: false,
    pageMessageReportsNotes: false,
    userReportCount: false,
    postReportCount: false,
    messageReportsCount: false,
    userReportsNotesCount: false,
    postReportsNotesCount: false,
    messageReportsNotesCount: false
  },
  adminSettings: {
    find: false,
    update: false
  },
  adminUsers: {
    update: false,
    find: false,
    addRoles: false,
    removeRoles: false,
    searchUsername: false,
    count: false,
    countAdmins: false,
    countModerators: false,
    page: false,
    pageAdmins: false,
    pageModerators: false,
    ban: false,
    unban: false
  },
  boards: {
    create: false,
    find: true,
    all: false,
    allCategories: true,
    updateCategories: false,
    update: false,
    delete: false
  },
  categories: {
    create: false,
    find: false,
    all: false,
    delete: false
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
    purge: false,
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
    sticky: false,
    move: false,
    delete: false
  },
  users: {
    update: true,
    find: true,
    deactivate: true,
    reactivate: true,
    delete: false
  }
};

roles.banned = {
  // business logic (none)
  name: 'banned',
  // ACLs
  adminReports: {
    createUserReportNote: false,
    createPostRepostNote: false,
    createMessageReportNote: false,
    updateUserReport: false,
    updatePostReport: false,
    updateMessageReport: false,
    updateUserReportNote: false,
    updatePostReportNote: false,
    updateMessageReportNote: false,
    pageUserReports: false,
    pagePostReports: false,
    pageMessageReport: false,
    pageUserReportsNotes: false,
    pagePostReportsNotes: false,
    pageMessageReportsNotes: false,
    userReportCount: false,
    postReportCount: false,
    messageReportsCount: false,
    userReportsNotesCount: false,
    postReportsNotesCount: false,
    messageReportsNotesCount: false
  },
  adminSettings: {
    find: false,
    update: false
  },
  adminUsers: {
    update: false,
    find: false,
    addRoles: false,
    removeRoles: false,
    searchUsername: false,
    count: false,
    countAdmins: false,
    countModerators: false,
    page: false,
    pageAdmins: false,
    pageModerators: false,
    ban: false,
    unban: false
  },
  boards: {
    create: false,
    find: true,
    all: false,
    allCategories: true,
    updateCategories: false,
    update: false,
    delete: false
  },
  categories: {
    create: false,
    find: false,
    all: false,
    delete: false
  },
  conversations: {
    create: true,
    messages: true,
    delete: false
  },
  messages: {
    create: true,
    latest: true,
    findUser: true,
    delete: false
  },
  posts: {
    create: false,
    find: true,
    byThread: true,
    update: false,
    delete: false,
    undelete: false,
    purge: false,
    pageByUser: true
  },
  reports: {
    createUserReport: false,
    createPostReport: false,
    createMessageReport: false
  },
  threads: {
    create: false,
    byBoard: true,
    viewed: true,
    title: false,
    lock: false,
    sticky: false,
    move: false,
    delete: false
  },
  users: {
    update: false,
    find: true,
    deactivate: false,
    reactivate: false,
    delete: false
  }
};

roles.anonymous = {
  // business logic (none)
  name: 'anonymous',
  // ACLs
  adminReports: {
    createUserReportNote: false,
    createPostRepostNote: false,
    createMessageReportNote: false,
    updateUserReport: false,
    updatePostReport: false,
    updateMessageReport: false,
    updateUserReportNote: false,
    updatePostReportNote: false,
    updateMessageReportNote: false,
    pageUserReports: false,
    pagePostReports: false,
    pageMessageReport: false,
    pageUserReportsNotes: false,
    pagePostReportsNotes: false,
    pageMessageReportsNotes: false,
    userReportCount: false,
    postReportCount: false,
    messageReportsCount: false,
    userReportsNotesCount: false,
    postReportsNotesCount: false,
    messageReportsNotesCount: false
  },
  adminSettings: {
    find: false,
    update: false
  },
  adminUsers: {
    update: false,
    find: false,
    addRoles: false,
    removeRoles: false,
    searchUsername: false,
    count: false,
    countAdmins: false,
    countModerators: false,
    page: false,
    pageAdmins: false,
    pageModerators: false,
    ban: false,
    unban: false
  },
  boards: {
    create: false,
    find: true,
    all: false,
    allCategories: true,
    updateCategories: false,
    update: false,
    delete: false
  },
  categories: {
    create: false,
    find: false,
    all: false,
    delete: false
  },
  conversations: {
    create: false,
    messages: false,
    delete: false
  },
  messages: {
    create: false,
    latest: false,
    findUser: false,
    delete: false
  },
  posts: {
    create: false,
    find: true,
    byThread: true,
    update: false,
    delete: false,
    undelete: false,
    purge: false,
    pageByUser: true
  },
  reports: {
    createUserReport: false,
    createPostReport: false,
    createMessageReport: false
  },
  threads: {
    create: false,
    byBoard: true,
    viewed: true,
    title: false,
    lock: false,
    sticky: false,
    move: false,
    delete: false
  },
  users: {
    update: false,
    find: true,
    deactivate: false,
    reactivate: false,
    delete: false
  }
};

// read from DB to replace defaults
