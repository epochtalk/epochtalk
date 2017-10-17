function subscribeToThread(request) {
  var threadId = request.pre.processed.thread_id;
  var authedUserId = request.auth.credentials.id;
  request.db.threadNotifications.subscribe(authedUserId, threadId);
  return;
}

function emailSubscribers(request) {
  var threadId = request.pre.processed.thread_id;
  var authedUserId = request.auth.credentials.id;
  var config = request.server.app.config;
  request.db.threadNotifications.getSubscriberEmailData(threadId, authedUserId)
  .each(function(emailData) {
    var emailParams = {
      email: emailData.email,
      username: emailData.username,
      thread_name: emailData.title,
      site_name: config.website.title,
      thread_url: config.publicUrl + '/threads/' + threadId + '/posts'
    };
    return request.emailer.send('threadNotification', emailParams)
    .then(function() {
      if (!emailData.thread_author) {
        var userId = request.db.helper.slugify(emailData.user_id);
        return request.db.threadNotifications.removeSubscription(userId, threadId);
      }
    })
    .catch(console.log);
  });
  return;
}

module.exports = [
  { path: 'posts.create.post', method: emailSubscribers },
  { path: 'posts.create.post', method: subscribeToThread },
  { path: 'threads.create.post', method: subscribeToThread }
];
