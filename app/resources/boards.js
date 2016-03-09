module.exports = ['$resource',
  function($resource) {
    return $resource('/api/boards/:id', {}, {
      query: {
        method: 'GET',
        url: '/api/boards'
      },
      update: { method: 'PUT', isArray: true },
      save: { method: 'POST', isArray: true },
      delete: { method: 'POST', url: '/api/boards/delete', isArray: true }
    });
  }
];
