
module.exports = {
  // =========== Admin Board Routes ===========
  'adminBoards.updateCategories': {
    genDisplayText: function() { return `Updated boards and categories`; },
    genDisplayUrl: function() { return `admin-management.boards`; }
  },

  // =========== Admin Moderator Routes ===========
  'adminModerators.add': { // TODO: query for board name
    genDisplayText: function(data) {
      return `added user(s) ${data.usernames.toString().replace(/,/g, ', ')} to list of moderators for board ${data.board_id}`;
    },
    genDisplayUrl: function(data) { return `^.board.data({ boardId: ${data.board_id} })`; },
  },
  'adminModerators.remove': { // TODO: query for board name
    genDisplayText: function(data) {
      return `removed user(s) ${data.usernames.toString().replace(/,/g, ', ')} from list of moderators for board ${data.board_id}`;
    },
    genDisplayUrl: function(data) { return `^.board.data({ boardId: ${data.board_id} })`; }
  },

   // =========== Admin Reports Routes ===========
  'adminReports.updateMessageReport': {
    genDisplayText: function() { return `updated a message report`; },
    genDisplayUrl: function(data) {
      return `admin-moderation.messages({ reportId: ${data.id} })`;
    }
  },
  'adminReports.createMessageReportNote': {
    genDisplayText: function() { return `created a note on a message report`; },
    genDisplayUrl: function(data) {
      return `admin-moderation.messages({ reportId: ${data.report_id} })`;
    }
  },
  'adminReports.updateMessageReportNote': { // TODO: add report id to payload
    genDisplayText: function() { return `edited their note on a message report`; },
    genDisplayUrl: function() { return `admin-moderation.messages()`; }
  },
  'adminReports.updatePostReport': {
    genDisplayText: function() { return `updated a post report`; },
    genDisplayUrl: function(data) {
      return `admin-moderation.posts({ reportId: ${data.id} })`;
    }
  },
  'adminReports.createPostReportNote': {
    genDisplayText: function() { return `created a note on a post report`; },
    genDisplayUrl: function(data) {
      return `admin-moderation.posts({ reportId: ${data.report_id} })`;
    }
  },
  'adminReports.updatePostReportNote': { // TODO: add report id to payload
    genDisplayText: function() { return `edited their note on a post report`; },
    genDisplayUrl: function() { return `admin-moderation.posts()`; }
  },
  'adminReports.updateUserReport': {
    genDisplayText: function() { return `updated a user report`; },
    genDisplayUrl: function(data) {
      return `admin-moderation.users({ reportId: ${data.id} })`;
    }
  },
  'adminReports.createUserReportNote': {
    genDisplayText: function() { return `created a note on a user report`; },
    genDisplayUrl: function(data) {
      return `admin-moderation.users({ reportId: ${data.report_id} })`;
    }
  },
  'adminReports.updateUserReportNote': { // TODO: add report id to payload
    genDisplayText: function() { return `edited their note on a user report`; },
    genDisplayUrl: function() { return `admin-moderation.users()`; }
  },

   // =========== Admin Roles Routes ===========
  'adminRoles.add': { // TODO: db query for role id for displayURLTemplate
    genDisplayText: function(data) { return `created a new role named ${data.name}`; },
    genDisplayUrl: function() { return `admin-management.roles`; }
  },
  'adminRoles.remove': { // TODO: db query for role name
    genDisplayText: function(data) { return `removed the role named ${data.id} `; },
    genDisplayUrl: function() { return `admin-management.roles`; }
  },
  'adminRoles.update': {
    genDisplayText: function(data) { return `updated the role named ${data.name}`; },
    genDisplayUrl: function(data) {
      return `admin-management.roles({ roleId: ${data.id} })`;
    }
  },
  'adminRoles.reprioritize': {
    genDisplayText: function() { return `reordered role priorities`; },
    genDisplayUrl: function() { return `admin-management.roles`; }
  },

   // =========== Admin Settings Routes ===========
  'adminSettings.update': {
    genDisplayText: function() { return `Updated forum settings`; },
    genDisplayUrl: function() { return `admin-settings.general`; }
  },
  'adminSettings.addToBlacklist': {
    genDisplayText: function(data) { return `added ip blacklist rule named ${data.note}`; },
    genDisplayUrl: function() { return `admin-settings.advanced`; }
  },
  'adminSettings.updateBlacklist': {
    genDisplayText: function(data) { return `updated ip blacklist rule named ${data.note}`; },
    genDisplayUrl: function() { return `admin-settings.advanced`; }
  },
  'adminSettings.deleteFromBlacklist': { // TODO: get blacklist rule name from params
    genDisplayText: function(data) { return `deleted ip blacklist rule with id ${data.id}`; },
    genDisplayUrl: function() { return `admin-settings.advanced`; }
  },
  'adminSettings.setTheme': {
    genDisplayText: function() { return `updated the forum theme`; },
    genDisplayUrl: function() { return `admin-settings.theme`; }
  },
  'adminSettings.resetTheme': {
    genDisplayText: function() { return `restored the forum to the default theme`; },
    genDisplayUrl: function() { return `admin-settings.theme`; }
  },

   // =========== Admin Users Routes ===========
  'adminUsers.update': {
    genDisplayText: function(data) { return `updated user ${data.username}`; },
    genDisplayUrl: function(data) { return `^.profile({ username: ${data.username} })`; }
  },
  'adminUsers.addRoles': { // TODO: send role name in payload
    genDisplayText: function(data) {
      return `added role ${data.role_id} to user(s) ${data.usernames.toString().replace(/,/g, ', ')} `;
    },
    genDisplayUrl: function(data) {
      return `admin-management.roles({ roleId: ${data.role_id }})`;
    }
  },
  'adminUsers.removeRoles': { // TODO: send role name in payload and username
    genDisplayText: function(data) {
      return `removed role ${data.role_id} from user ${data.user_id} `;
    },
    genDisplayUrl: function(data) {
      return `admin-management.roles({ roleId: ${data.role_id }})`;
    }
  },
  'adminUsers.ban': { // TODO: lookup username for user
    genDisplayText: function(data) {
      return `banned user ${data.user_id} until ${data.expiration}`;
    },
    genDisplayUrl: function() {
      return `admin-management.users({ filter: 'banned' })`;
    }
  },
  'adminUsers.unban': { // TODO: lookup username for user
    genDisplayText: function(data) {
      return `unbanned user ${data.user_id}`;
    },
    genDisplayUrl: function() {
      return `admin-management.users`;
    }
  },

   // =========== Boards Routes ===========
  'boards.create': {
    genDisplayText: function(data) { return `created board named ${data.name}`; },
    genDisplayUrl: function() { return `admin-management.boards`; }
  },
  'boards.update': {
    genDisplayText: function(data) { return `updated board named ${data.name}`; },
    genDisplayUrl: function() { return `admin-management.boards`; }
  },
  'boards.delete': { // TODO: Retrieve name of board
    genDisplayText: function(data) { return `deleted board named ${data.id}`; },
    genDisplayUrl: function() { return `admin-management.boards`; }
  },

   // =========== Threads Routes ===========
  'threads.title': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'threads.sticky': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'threads.createPoll': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'threads.viewed': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'threads.lock': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'threads.move': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'threads.lockPoll': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'threads.purge': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'threads.editPoll': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },

   // =========== Posts Routes ===========
  'posts.update': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'posts.undelete': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'posts.delete': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'posts.purge': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },

   // =========== Users Routes ===========
  'users.update': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'users.delete': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'users.reactivate': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },
  'users.deactivate': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },

   // =========== Conversations Routes ===========
  'conversations.delete': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  },

   // =========== Messages Routes ===========
  'messages.delete': {
    genDisplayText: function(data) { return ``; },
    genDisplayUrl: function(data) { return ``; }
  }
};
