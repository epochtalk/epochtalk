var Joi = require('@hapi/joi');

var validation =  Joi.object({
  // General
  createMessageReport: Joi.object({
    allow: Joi.boolean()
  }),
  createPostReport: Joi.object({
    allow: Joi.boolean()
  }),
  createUserReport: Joi.object({
    allow: Joi.boolean()
  }),

  // Messages
  pageMessageReports: Joi.object({
    allow: Joi.boolean()
  }),
  updateMessageReport: Joi.object({
    allow: Joi.boolean()
  }),
  createMessageReportNote: Joi.object({
    allow: Joi.boolean()
  }),
  pageMessageReportNotes: Joi.object({
    allow: Joi.boolean()
  }),
  updateMessageReportNote: Joi.object({
    allow: Joi.boolean()
  }),

  // Posts
  pagePostReports: Joi.object({
    allow: Joi.boolean()
  }),
  updatePostReport: Joi.object({
    allow: Joi.boolean()
  }),
  createPostReportNote: Joi.object({
    allow: Joi.boolean()
  }),
  pagePostReportNotes: Joi.object({
    allow: Joi.boolean()
  }),
  updatePostReportNote: Joi.object({
    allow: Joi.boolean()
  }),

  // Users
  pageUserReports: Joi.object({
    allow: Joi.boolean()
  }),
  updateUserReport: Joi.object({
    allow: Joi.boolean()
  }),
  createUserReportNote: Joi.object({
    allow: Joi.boolean()
  }),
  pageUserReportNotes: Joi.object({
    allow: Joi.boolean()
  }),
  updateUserReportNote: Joi.object({
    allow: Joi.boolean()
  })
});

var superAdministrator = {
  createMessageReport: { allow: true },
  createPostReport: { allow: true },
  createUserReport: { allow: true },

  pageMessageReports: { allow: true },
  updateMessageReport: { allow: true },
  createMessageReportNote: { allow: true },
  pageMessageReportNotes: { allow: true },
  updateMessageReportNote: { allow: true },

  pagePostReports: { allow: true },
  updatePostReport: { allow: true },
  createPostReportNote: { allow: true },
  pagePostReportNotes: { allow: true },
  updatePostReportNote: { allow: true },

  pageUserReports: { allow: true },
  updateUserReport: { allow: true },
  createUserReportNote: { allow: true },
  pageUserReportNotes: { allow: true },
  updateUserReportNote: { allow: true }
};

var administrator = {
  createMessageReport: { allow: true },
  createPostReport: { allow: true },
  createUserReport: { allow: true },

  pageMessageReports: { allow: true },
  updateMessageReport: { allow: true },
  createMessageReportNote: { allow: true },
  pageMessageReportNotes: { allow: true },
  updateMessageReportNote: { allow: true },

  pagePostReports: { allow: true },
  updatePostReport: { allow: true },
  createPostReportNote: { allow: true },
  pagePostReportNotes: { allow: true },
  updatePostReportNote: { allow: true },

  pageUserReports: { allow: true },
  updateUserReport: { allow: true },
  createUserReportNote: { allow: true },
  pageUserReportNotes: { allow: true },
  updateUserReportNote: { allow: true }
};

var globalModerator = {
  createMessageReport: { allow: true },
  createPostReport: { allow: true },
  createUserReport: { allow: true },

  pageMessageReports: { allow: true },
  updateMessageReport: { allow: true },
  createMessageReportNote: { allow: true },
  pageMessageReportNotes: { allow: true },
  updateMessageReportNote: { allow: true },

  pagePostReports: { allow: true },
  updatePostReport: { allow: true },
  createPostReportNote: { allow: true },
  pagePostReportNotes: { allow: true },
  updatePostReportNote: { allow: true },

  pageUserReports: { allow: true },
  updateUserReport: { allow: true },
  createUserReportNote: { allow: true },
  pageUserReportNotes: { allow: true },
  updateUserReportNote: { allow: true }
};

var moderator = {
  createMessageReport: { allow: true },
  createPostReport: { allow: true },
  createUserReport: { allow: true },

  pageMessageReports: { allow: true },
  updateMessageReport: { allow: true },
  createMessageReportNote: { allow: true },
  pageMessageReportNotes: { allow: true },
  updateMessageReportNote: { allow: true },

  pagePostReports: { allow: true },
  updatePostReport: { allow: true },
  createPostReportNote: { allow: true },
  pagePostReportNotes: { allow: true },
  updatePostReportNote: { allow: true },

  pageUserReports: { allow: true },
  updateUserReport: { allow: true },
  createUserReportNote: { allow: true },
  pageUserReportNotes: { allow: true },
  updateUserReportNote: { allow: true }
};

var patroller = {
  createMessageReport: { allow: true },
  createPostReport: { allow: true },
  createUserReport: { allow: true }
};

var user = {
  createMessageReport: { allow: true },
  createPostReport: { allow: true },
  createUserReport: { allow: true }
};

var newbie = {
  createMessageReport: { allow: true },
  createPostReport: { allow: true },
  createUserReport: { allow: true }
};

var layout = {
  generalTitle: { title: 'User Permissions', type: 'title' },
  createPostReport: { title: 'Report a Post' },
  createUserReport: { title: 'Report a User' },
  createMessageReport: { title: 'Report a Private Message' },

  postSeparator: { type: 'separator' },
  postTitle: { title: 'Post Report Admin Permissions', type: 'title' },
  pagePostReports: { title: 'View Post Reports' },
  updatePostReport: { title: 'Edit Post Report' },
  createPostReportNote: { title: 'Add a note to a Post Report' },
  pagePostReportNotes: { title: 'View Post Report Notes' },
  updatePostReportNote: { title: 'Edit Post Report Note' },

  userSeparator: { type: 'separator' },
  userTitle: { title: 'User Report Admin Permissions', type: 'title' },
  pageUserReports: { title: 'View User Reports' },
  updateUserReport: { title: 'Edit User Report' },
  createUserReportNote: { title: 'Add a note to a User Report' },
  pageUserReportNotes: { title: 'View User Report Notes' },
  updateUserReportNote: { title: 'Edit User Report Note' },

  messageSeparator: { type: 'separator' },
  messageTitle: { title: 'Message Report Admin Permissions', type: 'title' },
  pageMessageReports: { title: 'View Private Message Reports' },
  updateMessageReport: { title: 'Edit Private Message Report' },
  createMessageReportNote: { title: 'Add a note to a Private Message Report' },
  pageMessageReportNotes: { title: 'View Private Message Report Notes' },
  updateMessageReportNote: { title: 'Edit Private Message Report Note' }
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
    banned: {},
    anonymous: {},
    private: {}
  }
};
