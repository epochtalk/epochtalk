var path = require('path');
var threads = require(path.normalize(__dirname + '/config'));

// Export Routes/Pre
module.exports = [
  { method: 'POST', path: '/threads', config: threads.create },
  { method: 'GET', path: '/threads', config: threads.byBoard },
  { method: 'GET', path: '/threads/{id}', config: threads.find },
  // DON'T UPDATE THREAD (update should be done in post)
  // DON'T DELETE THREAD (for now, should delete all posts?)
  { method: 'POST', path: '/threads/import', config: threads.import },
  { method: 'POST', path: '/threads/{id}/lock', config: threads.lock }
];
