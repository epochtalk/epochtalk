'use strict';

module.exports =function ($resource) {
  return $resource('/auth/session/');
}
