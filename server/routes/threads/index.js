var path = require('path');
var threads = require(path.normalize(__dirname + '/config'));

// Export Routes/Pre
module.exports = [
  { method: 'POST', path: '/threads', config: threads.create },
  { method: 'GET', path: '/threads', config: threads.byBoard },
  { method: 'POST', path: '/threads/{id}', config: threads.title },
  { method: 'POST', path: '/threads/{id}/viewed', config: threads.viewed },
  { method: 'POST', path: '/threads/{id}/lock', config: threads.lock },
  { method: 'POST', path: '/threads/{id}/sticky', config: threads.sticky },
  { method: 'POST', path: '/threads/{id}/move', config: threads.move },
  { method: 'DELETE', path: '/threads/{id}', config: threads.purge },
  { method: 'POST', path: '/threads/{threadId}/polls', config: threads.createPoll },
  { method: 'PUT', path: '/threads/{threadId}/polls/{pollId}', config: threads.editPoll },
  { method: 'POST', path: '/threads/{threadId}/polls/{pollId}/vote', config: threads.vote },
  { method: 'DELETE', path: '/threads/{threadId}/polls/{pollId}/vote', config: threads.removeVote },
  { method: 'POST', path: '/threads/{threadId}/polls/{pollId}/lock', config: threads.lockPoll }
];
