var resource = ['$resource',
  function($resource) {
    return $resource('/api/automoderation', {}, {
      rules: {
        method: 'GET',
        url: '/api/automoderation/rules',
        isArray: true
      },
      addRule: {
        method: 'POST',
        url: '/api/automoderation/rules'
      },
      editRule: {
        method: 'PUT',
        url: '/api/automoderation/rules/:ruleId',
        params: { ruleId: '@ruleId' }
      },
      removeRule: {
        method: 'DELETE',
        url: '/api/automoderation/rules/:ruleId',
        params: { ruleId: '@ruleId' }
      }
    });
  }
];

angular.module('ept').factory('AutoModeration', resource);
