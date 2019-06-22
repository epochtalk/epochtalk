var resource = ['$resource',
  function($resource) {
    return $resource('/api/trust', {}, {
      addTrustFeedback: {
        method: 'POST'
      },
      getTrustList: {
        method: 'GET',
        url: '/api/trustlist'
      },
      editTrustList: {
        method: 'POST',
        url: '/api/trustlist'
      },
      getDefaultTrustList: {
        method: 'GET',
        url: '/api/admin/trustlist'
      },
      editDefaultTrustList: {
        method: 'POST',
        url: '/api/admin/trustlist'
      },
      getTrustTree: {
        method: 'GET',
        url: '/api/trusttree',
        isArray: true
      },
      getTrustStats: {
        method: 'GET',
        url: '/api/trust/:username',
        params: { username: '@username' }
      },
      getTrustFeedback: {
        method: 'GET',
        url: '/api/trustfeedback/:username',
        params: { username: '@username' }
      },
      getTrustBoards: {
        method: 'GET',
        url: '/api/trustboards',
        isArray: true
      },
      addTrustBoard: {
        method: 'POST',
        url: '/api/admin/trustboards'
      },
      deleteTrustBoard: {
        method: 'DELETE',
        url: '/api/admin/trustboards/:board_id',
        params: { board_id: '@board_id' }
      }
    });
  }
];

angular.module('ept').factory('UserTrust', resource);
