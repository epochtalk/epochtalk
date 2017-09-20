function subscribeToThread(request) {
  var threadId = request.pre.processed.thread_id;
  var authedUserId = request.auth.credentials.id;
  return request.db.threadNotifications.subscribe(authedUserId, threadId);
}

function emailSubscribers(request) {
  var threadId = request.pre.processed.thread_id;
  var authedUserId = request.auth.credentials.id;
  return request.db.threadNotifications.getSubscriberEmails(threadId, authedUserId)
  .then(function(subscribers) {
    // email subscribers here
  });
}

module.exports = [
  { path: 'posts.create.post', method: emailSubscribers },
  { path: 'posts.create.post', method: subscribeToThread },
  { path: 'threads.create.post', method: subscribeToThread }
];
