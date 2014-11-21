var posts = require(__dirname + '/configs/posts');

module.exports = [
  // CREATE NEW POST UNDER A THREAD
  { method: 'POST', path: '/posts', config: posts.create },
  // GET A SINGLE POST
  { method: 'GET', path: '/posts/{id}', config: posts.find },
  // QUERY for posts under: thread_id
  { method: 'GET', path: '/posts', config: posts.byThread },
  // UPDATE POST
  { method: 'POST', path: '/posts/{id}', config: posts.update },
  // DELETE POST
  { method: 'DELETE', path: '/posts/{id}', config: posts.delete },
  // IMPORT POST
  { method: 'POST', path: '/posts/import', config: posts.import }
];
