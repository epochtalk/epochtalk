var resource = ['$resource',
  function($resource) {
    return $resource('/api/posts/newbie', {}, {
      publicNewbiePosts: {
        method: 'GET',
        isArray: true
      }
    });
  }
];

angular.module('ept').factory('NewbiePatrol', resource);
