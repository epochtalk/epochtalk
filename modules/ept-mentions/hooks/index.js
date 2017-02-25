var Promise = require('bluebird');
var _ = require('lodash');

var mentionsRegex = /(@[a-zA-Z\d-_.]+)/g;

function userIdToUsername(request) {
//  console.log('POST BY THREAD POST', request.pre.processed.posts);
  return;
}

function usernameToUserId(request) {
  var body = request.payload.body;
  var rawBody = request.payload.raw_body;
  var usernamesArr = body.match(mentionsRegex);

  body = body.replace(mentionsRegex, u => '<' + u.toLowerCase() + '>');
  rawBody = rawBody.replace(mentionsRegex, u => '<' + u.toLowerCase() + '>');

  return Promise.reduce(usernamesArr, function(mentions, username) {
    username = username.substring(1);
    return request.db.users.userByUsername(username)
    .then(function(user) {
      mentions.push({ replacer: '<' + user.id + '>', replacee: '<@' + user.username.toLowerCase() + '>' });
      return mentions;
    })
    .catch(function() { return mentions; });
  }, [])
  .then(function(mentions) { return _.uniqWith(mentions, _.isEqual); })
  .each(function(mention) {
    body = body.replace(new RegExp(mention.replacee, 'g'), mention.replacer);
    rawBody = rawBody.replace(new RegExp(mention.replacee, 'g'), mention.replacer);

  })
  .then(function() {
    request.payload.body = body;
    request.payload.raw_body = rawBody;
  });
}


// REGEX MATCH
// Case 1: '@test' match @{word}
// Case 2: '@test @test' match all occurrences of @{word}
// Case 3: '@test@test'

// REGEX REPLACE
// Case 1: '@test @testawdawd' only replace @{word} not @{word}{othertext}
// Case 2: 'awdaw@test' only replace @{word} not {othertext}@{word}
// Case 3: '@test..' replace @{word}{punctuation}
// Case 4: '@test@test' replace @{word}@{word}

module.exports = [
  { path: 'posts.byThread.post', method: userIdToUsername },
  { path: 'posts.create.pre', method: usernameToUserId },
  { path: 'posts.update.pre', method: usernameToUserId },
  { path: 'threads.create.pre', method: usernameToUserId }
];
