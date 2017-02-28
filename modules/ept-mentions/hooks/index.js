var Promise = require('bluebird');
var _ = require('lodash');

var mentionsRegex = /(@[a-zA-Z\d-_.]+)/g;
var userIdRegex = /<@[^>]+>/g;

function userIdToUsername(request) {
  var posts = request.pre.processed.posts || [ request.payload ];
  return Promise.each(posts, post => {
    var userIds = post.body.match(userIdRegex) || [];
    userIds = _.uniqWith(userIds, _.isEqual);
    userIds = userIds.map(x => x.substring(2, x.length - 1));

    return Promise.each(userIds, userId => {
      return request.db.users.find(userId)
      .then(user => {
        var idRegex = new RegExp('<@' + userId + '>', 'g');

        // raw_body: <@123> -> @kkid
        if (post.raw_body) {
          post.raw_body = post.raw_body.replace(idRegex, '@' + user.username);
        }
        else {
          post.raw_body = post.body.replace(idRegex, '@' + user.username);
        }

        // body: <@123> -> <a ui-sref=".profiles('kkid')">kkid</a>
        var profileLink = '<a ui-sref="profile.posts({ username: \'' + user.username + '\'})">' + '@' + user.username + '</a>';
        post.body = post.body.replace(idRegex, profileLink);
      });
    });
  });
}

function usernameToUserId(request) {
  var body = request.payload.body;
  var rawBody = request.payload.raw_body;
  var usernamesArr = body.match(mentionsRegex) || [];
  usernamesArr = _.uniqWith(usernamesArr, _.isEqual);

  body = body.replace(mentionsRegex, u => '<' + u.toLowerCase() + '>');
  rawBody = rawBody.replace(mentionsRegex, u => '<' + u.toLowerCase() + '>');

  return Promise.reduce(usernamesArr, function(mentions, username) {
    username = username.substring(1);
    return request.db.users.userByUsername(username)
    .then(function(user) {
      mentions.push({ replacer: '<@' + user.id + '>', replacee: '<@' + user.username.toLowerCase() + '>' });
      return mentions;
    })
    .catch(function() {
      mentions.push({ replacer: '@' + username, replacee: '<@' + username + '>' });
      return mentions;
    });
  }, [])
  .each(function(mention) {
    body = body.replace(new RegExp(mention.replacee, 'g'), mention.replacer);
    rawBody = rawBody.replace(new RegExp(mention.replacee, 'g'), mention.replacer);
  })
  .then(function() {
    request.payload.body = body;
    request.payload.raw_body = rawBody;
  });
}

module.exports = [
  { path: 'posts.byThread.post', method: userIdToUsername },
  { path: 'posts.create.pre', method: usernameToUserId },
  { path: 'posts.update.pre', method: usernameToUserId },
  { path: 'posts.update.post', method: userIdToUsername },
  { path: 'threads.create.pre', method: usernameToUserId }
];
