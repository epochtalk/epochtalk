var Promise = require('bluebird');
var common = {};
module.exports = common;

common.parseOut = parseOut;

common.export = () =>  {
  return [
    {
      name: 'common.portal.parseOut',
      method: parseOut
    }
  ];
};


function parseOut(parser, threads) {
  if (!threads || !threads.length) { return threads; }
  return Promise.map(threads, function(thread) {
    thread.post_body = parser.parse(thread.post_body);
    return thread;
  });
}


common.formatThread = function(thread, userId) {
  // handle deleted user
  if (thread.user_deleted) {
    thread.user_id = '';
    thread.username = '';
  }

  // format user output
  thread.user = {
    id: thread.user_id,
    username: thread.username,
    deleted: thread.user_deleted
  };
  delete thread.user_id;
  delete thread.username;
  delete thread.user_deleted;

  // format last
  if (userId && !thread.last_viewed) {
    thread.has_new_post = true;
    thread.latest_unread_position = 1;
  }
  else if (userId && userId !== thread.last_post_user_id && thread.last_viewed <= thread.last_post_created_at) {
    thread.has_new_post = true;
    thread.latest_unread_position = thread.post_position;
    thread.latest_unread_post_id = thread.post_id;
  }
  delete thread.post_id;
  delete thread.post_position;
  delete thread.last_viewed;

  // handle last post formatting
  if (thread.last_post_deleted || thread.last_post_user_deleted) {
    thread.last_deleted = true;
    delete thread.last_post_id;
    delete thread.last_post_username;
    delete thread.last_post_created_at;
    delete thread.last_post_updated_at;
    delete thread.post_user_name;
    delete thread.post_role_name;
    delete thread.post_body;
    delete thread.post_avatar;
    delete thread.post_signature;
    delete thread.post_highlight_color;
    delete thread.user.id;
    delete thread.user.username;
    delete thread.user.deleted;
  }
  delete thread.last_post_deleted;
  delete thread.last_post_user_deleted;
  delete thread.last_post_user_id;
  return thread;
};
