var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('user-search', {
    url: '/search/users?field&desc&limit&page&search',
    reloadOnSearch: false,
    parent: 'public-layout',
    views: {
      'content': {
        controller: 'UserSearchCtrl',
        controllerAs: 'UserSearchCtrl',
        template: require('./search.html')
      }
    },
    resolve: {
      $title: [function() {
        return 'Member Search';
      }],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./search.controller');
          $ocLazyLoad.load({ name: 'ept.usersearch.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      pageData: ['$stateParams', 'User', function($stateParams, User) {
        var query = {
          field: $stateParams.field,
          desc: $stateParams.desc,
          limit: Number($stateParams.limit) || 15,
          page: Number($stateParams.page) || 1,
          search: $stateParams.search
        };
        return User.pagePublic(query).$promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.usersearch', ['ui.router'])
.config(route)
.name;
