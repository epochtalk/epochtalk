var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('ignored-users', {
    parent: 'public-layout',
    url: '/ignored?limit',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'IgnoreUsersCtrl',
        controllerAs: 'IgnoreUsersCtrl',
        templateUrl: '/static/templates/modules/ept-ignore-users/ignore-users.html'
      }
    },
    resolve: {
      $title: [ function() { return 'Ignored Users'; } ],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./ignore-users.controller');
          $ocLazyLoad.load([
            { name: 'ept.ignore-users.ctrl' },
            { name: 'ept.directives.autocomplete-user-id' }
          ]);
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      pageData: ['IgnoreUsers', '$stateParams', function(IgnoreUsers, $stateParams) {
        var query = { limit: Number($stateParams.limit) || 25 };
        return IgnoreUsers.ignored(query).$promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.ignore-users', ['ui.router'])
.config(route)
.name;
