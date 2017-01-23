var resource = ['$resource',
  function($resource) {
    return $resource('/api/ads', {}, {
      create: {
        method: 'POST',
        url: '/api/ads'
      },
      duplicate: {
        method: 'POST',
        url: '/api/ads/:adId/duplicate',
        params: { adId: '@adId' }
      },
      edit: {
        method: 'PUT',
        url: '/api/ads/:adId',
        params: { adId: '@adId' }
      },
      remove: {
        method: 'DELETE',
        url: '/api/ads/:adId',
        params: { adId: '@adId' }
      },
      view: {
        method: 'GET',
        url: '/api/ads'
      },
      analytics: {
        method: 'GET',
        url: '/api/ads/analytics/:round',
        params: { round: '@round' }
      },
      createFactoid: {
        method: 'POST',
        url: '/api/ads/factoids'
      },
      editFactoid: {
        method: 'PUT',
        url: '/api/ads/factoids/:factoidId',
        params: { factoidId: '@factoidId' }
      },
      removeFactoid: {
        method: 'DELETE',
        url: '/api/ads/factoids/:factoidId',
        params: { factoidId: '@factoidId' }
      },
      enableFactoid: {
        method: 'PUT',
        url: '/api/ads/factoids/:factoidId/enable',
        params: { factoidId: '@factoidId' }
      },
      disableFactoid: {
        method: 'PUT',
        url: '/api/ads/factoids/:factoidId/disable',
        params: { factoidId: '@factoidId' }
      },
      createRound: {
        method: 'POST',
        url: '/api/ads/rounds'
      },
      roundInfo: {
        method: 'GET',
        url: '/api/ads/rounds/info'
      },
      rotateRound: {
        method: 'POST',
        url: '/api/ads/rounds/rotate'
      },
      viewRound: {
        method: 'GET',
        url: '/api/ads/rounds/:roundNumber',
        params: { roundNumber: '@roundNumber' }
      },
      saveText: {
        method: 'POST',
        url: '/api/ads/text'
      }
    });
  }
];

angular.module('ept').factory('Ads', resource);
