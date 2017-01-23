var Joi = require('joi');

var validation =  Joi.object().keys({
  unread: Joi.object().keys({
    allow: Joi.boolean()
  }),
  edit: Joi.object().keys({
    allow: Joi.boolean()
  }),
  pageBoards: Joi.object().keys({
    allow: Joi.boolean()
  }),
  watchBoard: Joi.object().keys({
    allow: Joi.boolean()
  }),
  unwatchBoard: Joi.object().keys({
    allow: Joi.boolean()
  }),
  pageThreads: Joi.object().keys({
    allow: Joi.boolean()
  }),
  watchThread: Joi.object().keys({
    allow: Joi.boolean()
  }),
  unwatchThread: Joi.object().keys({
    allow: Joi.boolean()
  })
});

var superAdministrator = {
  unread: { allow: true },
  edit: { allow: true },
  pageBoards: { allow: true },
  watchBoard: { allow: true },
  unwatchBoard: { allow: true },
  pageThreads: { allow: true },
  watchThread: { allow: true },
  unwatchThread: { allow: true }
};

var administrator = {
  unread: { allow: true },
  edit: { allow: true },
  pageBoards: { allow: true },
  watchBoard: { allow: true },
  unwatchBoard: { allow: true },
  pageThreads: { allow: true },
  watchThread: { allow: true },
  unwatchThread: { allow: true }
};

var globalModerator = {
  unread: { allow: true },
  edit: { allow: true },
  pageBoards: { allow: true },
  watchBoard: { allow: true },
  unwatchBoard: { allow: true },
  pageThreads: { allow: true },
  watchThread: { allow: true },
  unwatchThread: { allow: true }
};

var moderator = {
  unread: { allow: true },
  edit: { allow: true },
  pageBoards: { allow: true },
  watchBoard: { allow: true },
  unwatchBoard: { allow: true },
  pageThreads: { allow: true },
  watchThread: { allow: true },
  unwatchThread: { allow: true }
};

var patroller = {
  unread: { allow: true },
  edit: { allow: true },
  pageBoards: { allow: true },
  watchBoard: { allow: true },
  unwatchBoard: { allow: true },
  pageThreads: { allow: true },
  watchThread: { allow: true },
  unwatchThread: { allow: true }
};

var user = {
  unread: { allow: true },
  edit: { allow: true },
  pageBoards: { allow: true },
  watchBoard: { allow: true },
  unwatchBoard: { allow: true },
  pageThreads: { allow: true },
  watchThread: { allow: true },
  unwatchThread: { allow: true }
};

var newbie = {
  unread: { allow: true },
  edit: { allow: true },
  pageBoards: { allow: true },
  watchBoard: { allow: true },
  unwatchBoard: { allow: true },
  pageThreads: { allow: true },
  watchThread: { allow: true },
  unwatchThread: { allow: true }
};

var banned = {
  unread: { allow: true },
  edit: { allow: true },
  pageBoards: { allow: true },
  watchBoard: { allow: true },
  unwatchBoard: { allow: true },
  pageThreads: { allow: true },
  watchThread: { allow: true },
  unwatchThread: { allow: true }
};

var layout = {
  unread: { title: 'View Watchlist Page' },
  edit: { title: 'View Edit Watchlist Page' },
  pageBoards: { title: 'Page Boards being watched' },
  watchBoard: { title: 'Watch Boards' },
  unwatchBoard: { title: 'Stop Watching Boards' },
  pageThreads: { title: 'Page Threads being watched' },
  watchThread: { title: 'Watch Threads' },
  unwatchThread: { title: 'Stop Watching Threads' }
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
    anonymous: {},
    private: {}
  }
};
