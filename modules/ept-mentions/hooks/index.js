var Promise = require('bluebird');
var _ = require('lodash');

var mentionsRegex = /(@[a-zA-Z\d-_.]+)/g;
var userIdRegex = /{@[^>]+?}/g;
var slugIdRegex = /^[A-Za-z0-9_-]{22}$/;

function userIdToUsername(request) {
  var posts;
  if (request.pre.processed.posts) {
    posts = request.pre.processed.posts;
  }
  else if (request.pre.processed.body_html) {
    posts = [ request.pre.processed ];
  }
  else if (request.pre.processed.threads) {
    posts = request.pre.processed.threads;
  }
  else if (request.pre.processed.data) {
    posts = request.pre.processed.data;
  }
  else { posts = [ request.payload ]; }
  return Promise.each(posts, post => {
    if (post.post_body) {
      post.body = post.post_body;
      post.body_html = post.post_body;
    }
    if (!post.body) { return; }
    var userIds = post.body.match(userIdRegex) || [];
    userIds = _.uniqWith(userIds, _.isEqual);
    userIds = userIds.map(x => x.substring(2, x.length - 1));

    return Promise.each(userIds, userId => {
      var validId = new RegExp(slugIdRegex).test(userId);
      if (!validId) { return; }
      return request.db.users.find(userId)
      .then(user => {
        var idRegex = new RegExp('{@' + userId + '}', 'g');
        // body: {@123} -> @kkid
        post.body = post.body.replace(idRegex, '@' + user.username);

        // bodyHtml: {@123} -> <a ui-sref=".profiles('kkid')">kkid</a>
        var profileLink = '<a ui-sref="profile.posts({ username: \'' + user.username + '\'})">' + '@' + user.username + '</a>';

        post.body_html = post.body_html.replace(idRegex, profileLink);
        if (post.post_body) {
          post.post_body = post.body_html;
          delete post.body;
          delete post.body_html;
        }
      });
    });
  });
}

function usernameToUserId(request) {
  return request.server.methods.auth.mentions.create(request.server, request.auth)
  .then(function(hasPermission) {
    if (!hasPermission) { return; }

    var body = request.payload.body;
    var usernamesArr = body.match(mentionsRegex) || [];
    usernamesArr = _.uniqWith(usernamesArr, _.isEqual);

    request.payload.body_original = request.payload.body;

    body = body.replace(mentionsRegex, u => '{' + u.toLowerCase() + '}');
    var mentionedIds = [];

    return Promise.reduce(usernamesArr, function(mentions, username) {
      username = username.substring(1);

      return request.db.users.userByUsername(username)
      .then(function(user) {
        mentionedIds.push(user.id);
        mentions.push({ replacer: '{@' + user.id + '}', replacee: '{@' + user.username.toLowerCase() + '}' });
        return mentions;
      })
      .catch(function() {
        mentions.push({ replacer: '@' + username, replacee: '{@' + username + '}' });
        return mentions;
      });
    }, [])
    .each(function(mention) {
      body = body.replace(new RegExp(mention.replacee, 'g'), mention.replacer);
    })
    .then(function() {
      request.payload.body = body;
      request.payload.mentioned_ids = mentionedIds;
    });
  });
}

function correctTextSearchVector(request) {
  var mentionIds = request.payload.mentioned_ids;
  if (!mentionIds || !mentionIds.length) { return; }
  var post = request.pre.processed;
  request.db.mentions.fixTextSearchVector(post)
  .then(function() { delete request.pre.processed.body_original; });
}

function removeMentionIds(request) {
  delete request.pre.processed.mentioned_ids;
  delete request.payload.mentioned_ids;
}

function createMention(request) {
  return request.server.methods.auth.mentions.create(request.server, request.auth)
  .then(function(hasPermission) {
    if (!hasPermission) { return; }

    var thread;
    var config = request.server.app.config;
    var post = request.pre.processed;
    var mentionedIds = request.payload.mentioned_ids.slice(0);
    delete request.pre.processed.mentioned_ids;
    delete request.payload.mentioned_ids;

    return Promise.each(mentionedIds, function(mentioneeId) {
      var mention = {
        threadId: post.thread_id,
        postId: post.id,
        mentionerId: post.user_id,
        mentioneeId: mentioneeId
      };

      // create the mention in db if user isn't being ignored
      return request.db.mentions.getUserIgnored(mentioneeId, post.user_id)
      .then(function(user) {
        if (user.ignored) { return; }
        return request.db.mentions.create(mention)
        .then(function(dbMention) {
          if (dbMention) {
            var mentionClone = _.cloneDeep(dbMention);
            var notification = {
              type: 'mention',
              sender_id: post.user_id,
              receiver_id: mentioneeId,
              channel: { type: 'user', id: mentioneeId },
              data: {
                action: 'refreshMentions',
                mentionId: mentionClone.id
              }
            };
            return request.server.plugins.notifications.spawnNotification(notification)
            .then(function() { return request.db.threads.getThreadFirstPost(post.thread_id); })
            .then(function(threadData) {
              thread = threadData;
              return request.db.users.find(mentioneeId);
            })
            .then(function(user) {
              var emailParams = {
                email: user.email,
                username: user.username,
                post_author: request.auth.credentials.username,
                thread_name: thread.title,
                site_name: config.website.title,
                thread_url: config.publicUrl + '/threads/' + post.thread_id + '/posts?start=' + post.position + '#' + post.id
              };
              // Do not return, otherwise user has to wait for email to send
              // before post is created
              request.emailer.send('mentionNotification', emailParams)
              .catch(console.log);
              return;
            });
          }
        });
      });

    });

  });
}

function userIgnoredMentions(request) {
  var user = request.pre.processed;
  var authedUserId;
  if (request.auth.isAuthenticated) { authedUserId = request.auth.credentials.id; }
  else { return user; }
  return request.db.mentions.getUserIgnored(authedUserId, user.id)
  .then(function(mentions) {
    if (mentions && mentions.ignored) {
      user.ignoreMentions = true;
    }
    return user;
  });
}

module.exports = [
  { path: 'posts.byThread.post', method: userIdToUsername },
  { path: 'posts.pageByUser.post', method: userIdToUsername },
  { path: 'posts.find.post', method: userIdToUsername },
  { path: 'posts.search.post', method: userIdToUsername },
  { path: 'mentions.page.post', method: userIdToUsername },
  { path: 'portal.view.post', method: userIdToUsername },
  { path: 'posts.update.post', method: userIdToUsername },
  { path: 'posts.update.post', method: correctTextSearchVector },
  { path: 'posts.create.pre', method: usernameToUserId },
  { path: 'posts.update.pre', method: usernameToUserId },
  { path: 'threads.create.pre', method: usernameToUserId },
  { path: 'posts.create.post', method: createMention },
  { path: 'posts.create.post', method: correctTextSearchVector },
  { path: 'posts.update.post', method: removeMentionIds },
  { path: 'threads.create.post', method: createMention },
  { path: 'threads.create.post', method: correctTextSearchVector },
  { path: 'users.find.post', method: userIgnoredMentions },
];
