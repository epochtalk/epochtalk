'use strict';
/* jslint node: true */

module.exports = ['$resource',
  function($resource) {
    return $resource('/api/admin/users/:username/', {}, {
      find: {
        method: 'GET',
        params: { username: '@username' },
        ignoreLoadingBar: true
      },
      getBannedBoards: {
        method: 'GET',
        params: { username: '@username' },
        url: '/api/admin/users/:username/bannedboards',
        isArray: true,
        ignoreLoadingBar: true
      },
      byBannedBoards: {
        method: 'GET',
        url: '/api/admin/users/banned'
      },
      banFromBoards: {
        method: 'PUT',
        url: '/api/admin/users/ban/boards'
      },
      unbanFromBoards: {
        method: 'PUT',
        url: '/api/admin/users/unban/boards'
      },
      update: {
        method: 'PUT',
        url: '/api/admin/users'
      },
      ban: {
        method: 'PUT',
        url: '/api/admin/users/ban'
      },
      unban: {
        method: 'PUT',
        url: '/api/admin/users/unban'
      },
      addRoles: {
        method: 'PUT',
        url: '/api/admin/users/roles/add',
        isArray: true
      },
      removeRoles: {
        method: 'PUT',
        url: '/api/admin/users/roles/remove'
      },
      count: {
        method: 'GET',
        url: '/api/admin/users/count',
        ignoreLoadingBar: true
      },
      searchUsernames: {
        method: 'GET',
        url: '/api/admin/users/search',
        isArray: true,
        ignoreLoadingBar: true
      },
      page: {
        method: 'GET',
        url: '/api/admin/users',
        isArray: true
      }
    });
  }
];
