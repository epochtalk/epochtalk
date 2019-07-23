var Promise = require('bluebird');

module.exports = {
  // =========== Admin Board Routes ===========
  'adminBoards.updateCategories': {
    genDisplayText: function() { return `updated boards and categories`; },
    genDisplayUrl: function() { return `admin-management.boards`; }
  },

  // =========== Admin Moderator Routes ===========
  'adminModerators.add': {
    genDisplayText: function(data) {
      return `added user(s) "${data.usernames.toString().replace(/,/g, ', ')}" to list of moderators for board "${data.board_name}"`;
    },
    genDisplayUrl: function(data) { return `threads.data({ boardId: '${data.board_id}' })`; },
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
      return `removed user(s) "${data.usernames.toString().replace(/,/g, ', ')}" from list of moderators for board "${data.board_name}"`;
    },
    genDisplayUrl: function(data) { return `threads.data({ boardId: '${data.board_id}' })`; },
    dataQuery: function(data, request) {
      return request.db.boards.find(data.board_id)
      .then(function(board) {
        data.board_name = board.name;
        data.board_moderators = board.moderators;
      });
    }
  },

   // =========== Admin Reports Routes ===========
  'reports.updateMessageReport': {
    genDisplayText: function(data) { return `updated the status of message report to "${data.status}"`; },
    genDisplayUrl: function(data) {
      return `^.messages({ reportId: '${data.id}' })`;
    }
  },
  'reports.createMessageReportNote': {
    genDisplayText: function() { return `created a note on a message report`; },
    genDisplayUrl: function(data) {
      return `^.messages({ reportId: '${data.report_id }' })`;
    }
  },
  'reports.updateMessageReportNote': {
    genDisplayText: function() { return `edited their note on a message report`; },
    genDisplayUrl: function(data) {
      return `^.messages({ reportId: '${data.report_id }' })`;
    }
  },
  'reports.updatePostReport': {
    genDisplayText: function(data) { return `updated the status of post report to "${data.status}"`; },
    genDisplayUrl: function(data) {
      return `^.posts({ reportId: '${data.id}' })`;
    }
  },
  'reports.createPostReportNote': {
    genDisplayText: function() { return `created a note on a post report`; },
    genDisplayUrl: function(data) {
      return `^.posts({ reportId: '${data.report_id}' })`;
    }
  },
  'reports.updatePostReportNote': {
    genDisplayText: function() { return `edited their note on a post report`; },
    genDisplayUrl: function(data) {
      return `^.posts({ reportId: '${data.report_id}' })`;
    }
  },
  'reports.updateUserReport': {
    genDisplayText: function(data) { return `updated the status of user report to "${data.status}"`; },
    genDisplayUrl: function(data) {
      return `^.users({ reportId: '${data.id}' })`;
    }
  },
  'reports.createUserReportNote': {
    genDisplayText: function() { return `created a note on a user report`; },
    genDisplayUrl: function(data) {
      return `^.users({ reportId: '${data.report_id}' })`;
    }
  },
  'reports.updateUserReportNote': {
    genDisplayText: function() { return `edited their note on a user report`; },
    genDisplayUrl: function(data) {
      return `^.users({ reportId: '${data.report_id}' })`;
    }
  },

   // =========== Admin Roles Routes ===========
  'adminRoles.add': {
    genDisplayText: function(data) { return `created a new role named "${data.name}"`; },
    genDisplayUrl: function(data) { return `admin-management.roles({ roleId: '${data.id}' })`; },
  },
  'adminRoles.remove': {
    genDisplayText: function(data) { return `removed the role named "${data.name}"`; },
    genDisplayUrl: function() { return `admin-management.roles`; }
  },
  'adminRoles.update': {
    genDisplayText: function(data) { return `updated the role named "${data.name}"`; },
    genDisplayUrl: function(data) {
      return `admin-management.roles({ roleId: '${data.id}' })`;
    }
  },
  'adminRoles.reprioritize': {
    genDisplayText: function() { return `reordered role priorities`; },
    genDisplayUrl: function() { return `admin-management.roles`; },
    dataQuery: function(data, request) {
      data.priorities = {};
      return request.db.roles.all()
      .each(function(role) {
        data.priorities[role.priority] = {
          id: role.id,
          lookup: role.lookup,
          name: role.name
        };
      });
    }
  },

   // =========== Admin Settings Routes ===========
  'adminSettings.update': {
    genDisplayText: function() { return `updated forum settings`; },
    genDisplayUrl: function() { return `admin-settings`; }
  },
  'adminSettings.addToBlacklist': {
    genDisplayText: function(data) { return `added ip blacklist rule named "${data.note}"`; },
    genDisplayUrl: function() { return `admin-settings.advanced`; }
  },
  'adminSettings.updateBlacklist': {
    genDisplayText: function(data) { return `updated ip blacklist rule named "${data.note}"`; },
    genDisplayUrl: function() { return `admin-settings.advanced`; }
  },
  'adminSettings.deleteFromBlacklist': {
    genDisplayText: function(data) { return `deleted ip blacklist rule named "${data.note}"`; },
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
  'adminUsers.addRoles': {
    genDisplayText: function(data) {
      return `added role "${data.role_name}" to user(s) "${data.usernames.toString().replace(/,/g, ', ')}"`;
    },
    genDisplayUrl: function(data) {
      return `admin-management.roles({ roleId: '${data.role_id}' })`;
    },
    dataQuery: function(data, request) {
      return request.db.roles.find(data.role_id)
      .then(function(role) { data.role_name = role.name; });
    }
  },
  'adminUsers.removeRoles': {
    genDisplayText: function(data) {
      return `removed role "${data.role_name}" from user "${data.username}"`;
    },
    genDisplayUrl: function(data) {
      return `admin-management.roles({ roleId: '${data.role_id}' })`;
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

  // =========== User Notes Routes ===========
  'userNotes.create': {
    genDisplayText: function(data) {
      return `created a moderation note for user "${data.username}"`;
    },
    genDisplayUrl: function(data) { return `profile({ username: '${data.username}' })`; },
    dataQuery: function(data, request) {
      return request.db.users.find(data.user_id)
      .then(function(user) { data.username = user.username; });
    }
  },
  'userNotes.update': {
    genDisplayText: function(data) {
      return `edited their moderation note for user "${data.username}"`;
    },
    genDisplayUrl: function(data) { return `profile({ username: '${data.username}' })`; },
    dataQuery: function(data, request) {
      return request.db.users.find(data.user_id)
      .then(function(user) { data.username = user.username; });
    }
  },
  'userNotes.delete': {
    genDisplayText: function(data) {
      return `deleted their moderation note for user "${data.username}"`;
    },
    genDisplayUrl: function(data) { return `profile({ username: '${data.username}' })`; },
    dataQuery: function(data, request) {
      return request.db.users.find(data.user_id)
      .then(function(user) { data.username = user.username; });
    }
  },

  // =========== Banning Routes ===========
  'bans.addAddresses': {
    genDisplayText: function(data) {
      var addresses = [];
      data.addresses.forEach(function(addrInfo) {
        var address = addrInfo.hostname || addrInfo.ip;
        addresses.push(address.toString().replace(/%/g, '*'));
      });
      return `banned the following addresses "${addresses.toString().replace(/,/g, ', ')}"`;
    },
    genDisplayUrl: function() { return `admin-management.banned-addresses`; },
  },
  'bans.editAddress': {
    genDisplayText: function(data) {
      var address = data.hostname || data.ip;
      return `edited banned address "${address.toString().replace(/%/g, '*')}" to ${data.decay ? 'decay' : 'not decay'} with a weight of ${data.weight}`;
    },
    genDisplayUrl: function(data) { return `admin-management.banned-addresses({ search: '${data.hostname || data.ip}' })`; },
  },
  'bans.deleteAddress': {
    genDisplayText: function(data) {
      var address = data.hostname || data.ip;
      return `deleted banned address "${address.toString().replace(/%/g, '*')}"`;
    },
    genDisplayUrl: function() { return `admin-management.banned-addresses`; },
  },
  'bans.ban': {
    genDisplayText: function(data) {
      var humanDate;
      if (data.expiration) {
        humanDate = data.expiration.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      return humanDate ? `temporarily banned user "${data.username}" until ${humanDate}` :
        `permanently banned user "${data.username}"`;
    },
    genDisplayUrl: function(data) { return `profile({ username: '${data.username}' })`; },
    dataQuery: function(data, request) {
      return request.db.users.find(data.user_id)
      .then(function(user) { data.username = user.username; });
    }
  },
  'bans.unban': {
    genDisplayText: function(data) { return `unbanned user "${data.username}"`; },
    genDisplayUrl: function(data) { return `profile({ username: '${data.username}' })`; },
    dataQuery: function(data, request) {
      return request.db.users.find(data.user_id)
      .then(function(user) { data.username = user.username; });
    }
  },
  'bans.banFromBoards': {
    genDisplayText: function(data) {
      return `banned user "${data.username}" from boards: "${data.boards}"`;
    },
    genDisplayUrl: function() { return `^.board-bans`; },
    dataQuery: function(data, request) {
      return request.db.users.find(data.user_id)
      .then(function(user) {
        data.username = user.username;
        return Promise.map(data.board_ids, function(boardId) {
          return request.db.boards.find(boardId)
          .then(function(board) { return board.name; });
        });
      })
      .then(function(boards) {
        data.boards = boards.join(', ');
      });
    }
  },
  'bans.unbanFromBoards': {
    genDisplayText: function(data) {
      return `unbanned user "${data.username}" from boards: "${data.boards}"`;
    },
    genDisplayUrl: function() { return `^.board-bans`; },
    dataQuery: function(data, request) {
      return request.db.users.find(data.user_id)
      .then(function(user) {
        data.username = user.username;
        return Promise.map(data.board_ids, function(boardId) {
          return request.db.boards.find(boardId)
          .then(function(board) { return board.name; });
        });
      })
      .then(function(boards) {
        data.boards = boards.join(', ');
      });
    }
  },

   // =========== Boards Routes ===========
  'boards.create': {
    genDisplayText: function(data) { return `created board named "${data.boards.map(function(board) { return board.name; }).join(', ') }"`; },
    genDisplayUrl: function() { return `admin-management.boards`; }
  },
  'boards.update': {
    genDisplayText: function(data) { return `updated board named "${data.boards.map(function(board) { return board.name; }).join(', ') }"`; },
    genDisplayUrl: function() { return `admin-management.boards`; }
  },
  'boards.delete': {
    genDisplayText: function(data) { return `deleted board named "${data.names}"`; },
    genDisplayUrl: function() { return `admin-management.boards`; }
  },

   // =========== Threads Routes ===========
  'threads.title': {
    genDisplayText: function(data) { return `updated the title of a thread created by user "${data.author.username}" to "${data.title}"`; },
    genDisplayUrl: function(data) { return `posts.data({ threadId: '${data.id}' })`; },
    dataQuery: retrieveThread
  },
  'threads.lock': {
    genDisplayText: function(data) {
      var prefix = data.locked ? 'locked' : 'unlocked';
      return prefix + ` the thread "${data.title}" created by user "${data.author.username}"`;
    },
    genDisplayUrl: function(data) { return `posts.data({ threadId: '${data.id}' })`; },
    dataQuery: function(data, request) {
      return retrieveThread(data, request)
      .then(function(thread) { data.title = thread.title; });
    }
  },
  'threads.sticky': {
    genDisplayText: function(data) {
      var prefix = data.stickied ? 'stickied' : 'unstickied';
      return prefix + ` the thread "${data.title}" created by user "${data.author.username}"`;
    },
    genDisplayUrl: function(data) { return `posts.data({ threadId: '${data.id}' })`; },
    dataQuery: function(data, request) {
      return retrieveThread(data, request)
      .then(function(thread) { data.title = thread.title; });
    }
  },
  'threads.move': {
    genDisplayText: function(data) {
      return `moved the thread named "${data.title}" created by user "${data.author.username}" from board "${data.old_board_name}" to "${data.new_board_name}"`;
    },
    genDisplayUrl: function(data) { return `posts.data({ threadId: '${data.id}' })`; },
    dataQuery: function(data, request) {
      return retrieveThread(data, request)
      .then(function(thread) {
        data.title = thread.title;
        return request.db.boards.find(data.new_board_id);
      })
      .then(function(board) { data.new_board_name = board.name; });
    }
  },
  'threads.purge': {
    genDisplayText: function(data) { return `purged thread "${data.title}" created by user "${data.author.username}" from board "${data.board_name}"`; },
    genDisplayUrl: function() { return null; },
    dataQuery: function(data, request) {
      return request.db.users.find(data.user_id)
      .then(function(user) {
        delete data.user_id;
        data.author = {
          id: user.id,
          username: user.username,
          email: user.email
        };
        return request.db.boards.find(data.board_id);
      })
      .then(function(board) { data.board_name = board.name; });
    }
  },
  'threads.editPoll': {
    genDisplayText: function(data) {
      return `edited a poll in thread named "${data.thread_title}" created by user "${data.author.username}"`;
    },
    genDisplayUrl: function(data) { return `posts.data({ threadId: '${data.thread_id}' })`; },
    dataQuery: function(data, request) {
      return retrieveThread(data, request)
      .then(function(thread) { data.thread_title = thread.title; });
    }
  },
  'threads.createPoll': {
    genDisplayText: function(data) {
      return `created a poll in thread named "${data.thread_title}" created by user "${data.author.username}"`;
    },
    genDisplayUrl: function(data) { return `posts.data({ threadId: '${data.thread_id}' })`; },
    dataQuery: function(data, request) {
      return retrieveThread(data, request)
      .then(function(thread) { data.thread_title = thread.title; });
    }
  },
  'threads.lockPoll': {
    genDisplayText: function(data) {
      var prefix = data.locked ? 'locked' : 'unlocked';
      return prefix + ` poll in thread named "${data.thread_title}" created by user "${data.author.username}"`;
    },
    genDisplayUrl: function(data) { return `posts.data({ threadId: '${data.thread_id}' })`; },
    dataQuery: function(data, request) {
      return retrieveThread(data, request)
      .then(function(thread) { data.thread_title = thread.title; });
    }
  },

   // =========== Posts Routes ===========
  'posts.update': {
    genDisplayText: function(data) { return `updated post created by user "${data.author.username}" in thread named "${data.thread_title}"`; },
    genDisplayUrl: function(data) {
      return `posts.data({ threadId: '${data.thread_id}', start: ${data.position}, '#': '${data.id}' })`;
    },
    dataQuery: retrievePost
  },
  'posts.delete': {
    genDisplayText: function(data) { return `hid post created by user "${data.author.username}" in thread "${data.thread_title}"`; },
    genDisplayUrl: function(data) {
      return `posts.data({ threadId: '${data.thread_id}', start: ${data.position}, '#': '${data.id}' })`;
    },
    dataQuery: retrievePost
  },
  'posts.undelete': {
    genDisplayText: function(data) { return `unhid post created by user "${data.author.username}" in thread "${data.thread_title}"`; },
    genDisplayUrl: function(data) {
      return `posts.data({ threadId: '${data.thread_id}', start: ${data.position}, '#': '${data.id}' })`;
    },
    dataQuery: retrievePost
  },
  'posts.purge': {
    genDisplayText: function(data) {
      return `purged post created by user "${data.author.username}" in thread "${data.thread_title}"`;
    },
    genDisplayUrl: function(data) { return `posts.data({ threadId: '${data.thread_id}' })`; },
    dataQuery: function(data, request) {
      return request.db.users.find(data.user_id)
      .then(function(user) {
        data.author = {
          id: user.id,
          username: user.username,
          email: user.email
        };
        return request.db.threads.find(data.thread_id);
      })
      .then(function(thread) { data.thread_title = thread.title; });
    }
  },

   // =========== Users Routes ===========
   'users.update': {
     genDisplayText: function(data) { return `Updated user account "${data.username}"`; },
     genDisplayUrl: function(data) { return `profile({ username: '${data.username}' })`; }
   },
  'users.deactivate': {
    genDisplayText: function(data) { return `deactivated user account "${data.username}"`; },
    genDisplayUrl: function(data) { return `profile({ username: '${data.username}' })`; },
    dataQuery: function(data, request) {
      return request.db.users.find(data.id)
      .then(function(user) {
        data.username = user.username;
        data.email = user.email;
      });
    }
  },
  'users.reactivate': {
    genDisplayText: function(data) { return `reactivated user account "${data.username}"`; },
    genDisplayUrl: function(data) { return `profile({ username: '${data.username}' })`; },
    dataQuery: function(data, request) {
      return request.db.users.find(data.id)
      .then(function(user) {
        data.username = user.username;
        data.email = user.email;
      });
    }
  },
  'users.delete': {
    genDisplayText: function(data) { return `purged user account "${data.username}"`; },
    genDisplayUrl: function() { return null; }
  },

   // =========== Conversations Routes ===========
  'conversations.delete': {
    genDisplayText: function(data) {
      return `deleted conversation between users "${data.sender.username}" and "${data.receivers.map(function(u) {return u.username;}).toString().replace(/,/g, ', ')}"`;
    },
    genDisplayUrl: function() { return null; },
    dataQuery: retrieveParticipants
  },

   // =========== Messages Routes ===========
  'messages.delete': {
    genDisplayText: function(data) {
      return `deleted message sent from user "${data.sender.username}" to "${data.receivers.map(function(u) {return u.username;}).toString().replace(/,/g, ', ')}"`;
    },
    genDisplayUrl: function() { return null; },
    dataQuery: retrieveParticipants
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
    if (post.user.id === request.auth.credentials.id) { return Promise.reject(new Error('User is editing their own post')); }
    data.author = {
      username: post.user.username,
      id: post.user.id
    };
    data.position = post.position;
    return post;
  })
  .then(function(post) {
    data.thread_id = post.thread_id;
    return request.db.threads.find(data.thread_id);
  })
  .then(function(thread) { data.thread_title = thread.title; });
}

// Conversations and Messages helper function
function retrieveParticipants(data, request) {
  return request.db.users.find(data.sender_id)
  .then(function(sender) {
    // We dont care if user is deleting a conversation they started
    if (sender.id === request.auth.credentials.id) { return Promise.reject(); }
    delete data.sender_id;
    data.sender = {
      id: sender.id,
      username: sender.username,
      email: sender.email
    };
    data.receivers = [];
    return Promise.each(data.receiver_ids, function(id) {
      return request.db.users.find(id)
      .then(function(receiver) {
        data.receivers.push({
          id: receiver.id,
          username: receiver.username,
          email: receiver.email
        });
      });
    });
  })
  .then(function() { return data; });
}
