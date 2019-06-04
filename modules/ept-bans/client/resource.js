var resource = ['$resource',
  function($resource) {
    return $resource('/api/ban/addresses', {}, {
      getBannedBoards: {
        method: 'GET',
        params: { username: '@username' },
        url: '/api/users/:username/bannedboards',
        isArray: true,
        ignoreLoadingBar: true
      },
      byBannedBoards: {
        method: 'GET',
        url: '/api/users/banned'
      },
      banFromBoards: {
        method: 'PUT',
        url: '/api/users/ban/boards'
      },
      unbanFromBoards: {
        method: 'PUT',
        url: '/api/users/unban/boards'
      },
      ban: {
        method: 'PUT',
        url: '/api/users/ban'
      },
      unban: {
        method: 'PUT',
        url: '/api/users/unban'
      },
      pageBannedAddresses: {
        method: 'GET'
      },
      addAddresses: {
        method: 'POST',
        isArray: true
      },
      editAddress: {
        method: 'PUT'
      },
      deleteAddress: {
        method: 'DELETE'
      }
    });
  }
];

angular.module('ept').factory('Bans', resource);
