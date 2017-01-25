module.exports = {
  method: 'GET',
  path: '/api/categories',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'categories.all' },
    pre: [ { method: 'auth.categories.all(server, auth)' } ],
  },
  handler: function(request, reply) {
    var promise = request.db.categories.all();
    return reply(promise);
  }
};
