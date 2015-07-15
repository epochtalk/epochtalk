var path = require('path');
var threads = require(path.normalize(__dirname + '/config'));

// Export Routes/Pre
module.exports = [
  { method: 'POST', path: '/threads', config: threads.create },
  { method: 'GET', path: '/threads', config: threads.byBoard },
  { method: 'GET', path: '/threads/{id}', config: threads.find },
  // DON'T UPDATE THREAD
  { method: 'POST', path: '/threads/import', config: threads.import },
  { method: 'POST', path: '/threads/{id}/lock', config: threads.lock },
  { method: 'POST', path: '/threads/{id}/sticky', config: threads.sticky },
  { method: 'POST', path: '/threads/{id}/move', config: threads.move },
  { method: 'DELETE', path: '/threads/{id}', config: threads.delete },
  { method: 'POST', path: '/threads/{id}/undelete', config: threads.undelete },
  { method: 'DELETE', path: '/threads/{id}/purge', config: threads.purge }
];
