var resource = ['$resource',
  function($resource) {
    return $resource('/api/posts/newbie', {}, {
      patrolPosts: {
        method: 'GET',
        url: '/api/posts/patrol'
      }
    });
  }
];

angular.module('ept').factory('Patroller', resource);
