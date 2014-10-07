var threads = require(__dirname + '/configs/threads');

module.exports = [
  // CREATE THREAD
  { method: 'POST', path: '/threads', config: threads.create },
  // QUERY for threads under: board_id
  { method: 'GET', path: '/threads', config: threads.byBoard },
  // GET
  { method: 'GET', path: '/threads/{id}', config: threads.find },
  // { method: 'GET', path: '/thread/', config: threads.find }
  // DON'T UPDATE THREAD (update should be done in post)
  // DON'T DELETE THREAD (for now, should delete all posts?)
];