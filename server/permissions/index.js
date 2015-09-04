var permissions = {};
module.exports = permissions;

// read from disk

permissions.admin = {
  settings: {},
  categories: {},
  boards: {},
  threads: {},
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
  messages: {},
};
