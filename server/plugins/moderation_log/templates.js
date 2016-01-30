var Promise = require('bluebird');
module.exports = {
  // =========== Admin Board Routes ===========
  'adminBoards.updateCategories': {
    genDisplayText: function() { return `Updated boards and categories`; },
    genDisplayUrl: function() { return `admin-management.boards`; }
  },

  // =========== Admin Moderator Routes ===========
  'adminModerators.add': {
    genDisplayText: function(data) {
      return `added user(s) ${data.usernames.toString().replace(/,/g, ', ')} to list of moderators for board ${data.board_name}`;
    },
    genDisplayUrl: function(data) { return `^.board.data({ boardId: ${data.board_id} })`; },
    dataQuery: function(data, request) {
      return request.db.boards.find(data.board_id)
      .then(function(board) {
        data.board_name = board.name;
        data.board_moderators = board.moderators;
      });
    }
  },
  'adminModerators.remove': {
    genDisplayText: function(data) {
      return `removed user(s) ${data.usernames.toString().replace(/,/g, ', ')} from list of moderators for board ${data.board_name}`;
    },
    genDisplayUrl: function(data) { return `^.board.data({ boardId: ${data.board_id} })`; },
    dataQuery: function(data, request) {
      return request.db.boards.find(data.board_id)
      .then(function(board) {
        data.board_name = board.name;
        data.board_moderators = board.moderators;
      });
    }
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
      return `admin-moderation.messages({ reportId: ${data.report_id } })`;
    }
  },
  'adminReports.updateMessageReportNote': {
    genDisplayText: function() { return `edited their note on a message report`; },
    genDisplayUrl: function(data) {
      return `admin-moderation.messages({ reportId: ${data.report_id } })`;
    }
  },
  'adminReports.updatePostReport': {
    genDisplayText: function() { return `updated a post report`; },
    genDisplayUrl: function(data) {
      return `admin-moderation.posts({ reportId: ${data.report_id} })`;
    }
  },
  'adminReports.createPostReportNote': {
    genDisplayText: function() { return `created a note on a post report`; },
    genDisplayUrl: function(data) {
      return `admin-moderation.posts({ reportId: ${data.report_id} })`;
    }
  },
  'adminReports.updatePostReportNote': {
    genDisplayText: function() { return `edited their note on a post report`; },
    genDisplayUrl: function(data) {
      return `admin-moderation.posts({ reportId: ${data.report_id } })`;
    }
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
  'adminReports.updateUserReportNote': {
    genDisplayText: function() { return `edited their note on a user report`; },
    genDisplayUrl: function(data) {
      return `admin-moderation.users({ reportId: ${ data.report_id } })`;
    }
  },

   // =========== Admin Roles Routes ===========
  'adminRoles.add': {
    genDisplayText: function(data) { return `created a new role named ${data.name}`; },
    genDisplayUrl: function(data) { return `admin-management.roles({ roleId: ${data.id} })`; },
  },
  'adminRoles.remove': {
    genDisplayText: function(data) { return `removed the role named ${data.name} `; },
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
  'adminSettings.deleteFromBlacklist': {
    genDisplayText: function(data) { return `deleted ip blacklist rule "${data.note}"`; },
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
  'adminUsers.addRoles': {
    genDisplayText: function(data) {
      return `added role ${data.role_id} to user(s) ${data.usernames.toString().replace(/,/g, ', ')} `;
    },
    genDisplayUrl: function(data) {
      return `admin-management.roles({ roleId: ${data.role_id }})`;
    },
    dataQuery: function(data, request) {
      return request.db.roles.find(data.role_id)
      .then(function(role) { data.role_name = role.name; });
    }
  },
  'adminUsers.removeRoles': { // TODO: send role name in payload and username
    genDisplayText: function(data) {
      return `removed role ${data.role_id} from user ${data.user_id} `;
    },
    genDisplayUrl: function(data) {
      return `admin-management.roles({ roleId: ${data.role_id }})`;
    },
    dataQuery: function(data, request) {
      return request.db.roles.find(data.role_id)
      .then(function(role) {
        data.role_name = role.name;
        return request.db.users.find(data.user_id);
      })
      .then(function(user) { data.username = user.username; });
    }
  },
  'adminUsers.ban': { // TODO: lookup username for user
    genDisplayText: function(data) {
      return `banned user ${data.username} until ${data.expiration}`;
    },
    genDisplayUrl: function() {
      return `admin-management.users({ filter: 'banned' })`;
    },
    dataQuery: function(data, request) {
      return request.db.users.find(data.user_id)
      .then(function(user) { data.username = user.username; });
    }
  },
  'adminUsers.unban': {
    genDisplayText: function(data) {
      return `unbanned user ${data.username}`;
    },
    genDisplayUrl: function() {
      return `admin-management.users`;
    },
    dataQuery: function(data, request) {
      return request.db.users.find(data.user_id)
      .then(function(user) { data.username = user.username; });
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
  'boards.delete': {
    genDisplayText: function(data) { return `deleted board named ${data.name}`; },
    genDisplayUrl: function() { return `admin-management.boards`; }
  },

   // =========== Threads Routes ===========
  'threads.title': {
    genDisplayText: function(data) { return `updated the title of a thread to "${data.title}"`; },
    genDisplayUrl: function(data) { return `^.posts.data({ threadId: ${data.id} })`; },
    dataQuery: function(data, request) { return retrieveThread(data, request); }
  },
  'threads.lock': {
    genDisplayText: function(data) {
      var msg = `unlocked thread "${data.title}"`;
      if (data.locked) { msg = `locked thread "${data.title}"`; }
      return msg;
    },
    genDisplayUrl: function(data) { return `^.posts.data({ threadId: ${data.id} })`; },
    dataQuery: function(data, request) {
      return retrieveThread(data, request)
      .then(function(thread) { data.title = thread.title; });
    }
  },
  'threads.sticky': {
    genDisplayText: function(data) {
      var msg = `unstickied thread "${data.title}"`;
      if (data.stickied) { msg = `stickied thread ${data.id}`; }
      return msg;
    },
    genDisplayUrl: function(data) { return `^.posts.data({ threadId: ${data.id} })`; },
    dataQuery: function(data, request) {
      return retrieveThread(data, request)
      .then(function(thread) { data.title = thread.title; });
    }
  },
  'threads.move': { // TODO: Retrieve old board name
    genDisplayText: function(data) {
      return `moved thread "${data.title}" to board "${data.new_board_name}"`;
    },
    genDisplayUrl: function(data) { return `^.posts.data({ threadId: ${data.id} })`; },
    dataQuery: function(data, request) {
      return retrieveThread(data, request)
      .then(function(thread) {
        data.title = thread.title;
        return request.db.boards.find(data.new_board_id);
      })
      .then(function(board) { data.new_board_name = board.name; });
    }
  },
  'threads.purge': { // TODO: retrieve name before purge
    genDisplayText: function(data) { return `purged thread with id ${data}`; },
    genDisplayUrl: function() { return null; }
  },
  'threads.editPoll': {
    genDisplayText: function(data) { return `edited a poll in thread "${data.thread_title}"`; },
    genDisplayUrl: function(data) { return `^.posts.data({ threadId: ${data.thread_id} })`; },
    dataQuery: function(data, request) {
      return retrieveThread(data, request)
      .then(function(thread) { data.thread_title = thread.title; });
    }
  },
  'threads.createPoll': {
    genDisplayText: function(data) { return `created a poll in thread "${data.thread_title}"`; },
    genDisplayUrl: function(data) { return `^.posts.data({ threadId: ${data.thread_id} })`; },
    dataQuery: function(data, request) {
      return retrieveThread(data, request)
      .then(function(thread) { data.thread_title = thread.title; });
    }
  },
  'threads.lockPoll': {
    genDisplayText: function(data) {
      var msg = `unlocked poll in thread "${data.thread_title}"`;
      if (data.locked) { msg = `locked poll in thread "${data.thread_title}"`; }
      return msg;
    },
    genDisplayUrl: function(data) { return `^.posts.data({ threadId: ${data.thread_id} })`; },
    dataQuery: function(data, request) {
      return retrieveThread(data, request)
      .then(function(thread) { data.thread_title = thread.title; });
    }
  },

   // =========== Posts Routes ===========
  'posts.update': {
    genDisplayText: function(data) { return `updated post in thread ${data.thread_id}`; },
    genDisplayUrl: function(data) {
      return `^.posts.data({ threadId: ${data.thread_id}, start: ${data.position}, '#': ${data.id} })`;
    },
    dataQuery: function(data, request) {
      return retrievePost(data, request);
    }
  },
  'posts.delete': {
    genDisplayText: function(data) { return `hid post by ${data.author.username} in thread "${data.thread_title}"`; },
    genDisplayUrl: function(data) {
      return `^.posts.data({ threadId: ${data.thread_id}, '#': ${data.id} })`;
    },
    dataQuery: function(data, request) {
      return retrievePost(data, request)
      .then(function(post) {
        data.thread_id = post.thread_id;
        return request.db.threads.find(data.thread_id);
      })
      .then(function(thread) { data.thread_title = thread.title; });
    }
  },
  'posts.undelete': {
    genDisplayText: function(data) { return `unhid post by ${data.author.username} in thread "${data.thread_title}"`; },
    genDisplayUrl: function(data) {
      return `^.posts.data({ threadId: ${data.thread_id}, '#': ${data.id} })`;
    },
    dataQuery: function(data, request) {
      return retrievePost(data, request)
      .then(function(post) {
        data.thread_id = post.thread_id;
        return request.db.threads.find(data.thread_id);
      })
      .then(function(thread) { data.thread_title = thread.title; });
    }
  },
  'posts.purge': { // TODO: query for thread title, id and user info
    genDisplayText: function(data) { return `purged post ${data.id}`; },
    genDisplayUrl: function(data) {
      // return `^.posts.data({ threadId: ${data.thread_id}, '#': ${data.id} })`;
      return null;
    }
  },

   // =========== Users Routes ===========
  // 'users.update': { // Mods/Admins us adminUsers.update
  //   genDisplayText: function(data) { return ``; },
  //   genDisplayUrl: function(data) { return ``; }
  // },
  'users.deactivate': { // TODO: Query for user by id
    genDisplayText: function(data) { return `deactivated user ${data.id}`; },
    genDisplayUrl: function(data) { return ``; }
  },
  'users.reactivate': { // TODO: Query for user by id
    genDisplayText: function(data) { return `reactivated user ${data.id}`; },
    genDisplayUrl: function(data) { return ``; }
  },
  'users.delete': {
    genDisplayText: function(data) { return `purged user ${data.id}`; },
    genDisplayUrl: function() { return null; }
  },

   // =========== Conversations Routes ===========
  'conversations.delete': { // TODO: Query receiver and sender
    genDisplayText: function(data) { return `deleted conversation between x and y`; },
    genDisplayUrl: function() { return null; }
  },

   // =========== Messages Routes ===========
  'messages.delete': { // TODO: Query receiver and sender
    genDisplayText: function(data) { return `deleted message from x sent to y`; },
    genDisplayUrl: function() { return null; }
  }
};


// Thread helper function
function retrieveThread(data, request) {
  var threadId = data.thread_id || data.id;
  return request.db.threads.find(threadId)
  .then(function(thread) {
    // don't log mods/admins modifying their own threads
    if (thread.user.id === request.auth.credentials.id) { return Promise.reject(); }
    data.author = {
      id: thread.user.id,
      username: thread.user.username
    };
    return thread;
  });
}

// Post helper function
function retrievePost(data, request) {
  return request.db.posts.find(data.id)
  .then(function(post){
    // don't log mods/admins modifying their own posts
    if (post.user.id === request.auth.credentials.id) { return Promise.reject(); }
    data.author = {
      username: post.user.username,
      id: post.user.id
    };
    data.position = post.position;
    return post;
  });
}
