'use strict';

module.exports = function($resource) {
  return $resource('/api/users/:id/', {}, {
    'update': {
      method:'PUT'
    }
  });
};
