'use strict';

module.exports = function($resource) {
  return $resource('/auth/users/:id/', {},
    {
      'update': {
        method:'PUT'
      }
    });
};
