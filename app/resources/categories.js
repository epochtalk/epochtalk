module.exports = ['$resource',
  function($resource) {
    return $resource('/api/categories/:id', {}, {
      all: {
        method: 'GET',
        url: '/api/boards',
        isArray: true
      },
      save: { method: 'POST', isArray: true },
      delete: { method: 'POST', url: '/api/categories/delete', isArray: true }
    });
  }
];
