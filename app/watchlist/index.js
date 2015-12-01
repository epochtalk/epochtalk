var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('watchlist', {
    parent: 'public-layout',
    url: '/watchlist?limit',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'WatchlistCtrl',
        controllerAs: 'WatchlistCtrl',
        templateUrl: '/static/templates/watchlist/watchlist.html'
      }
    },
    resolve: {
      $title: [ function() { return 'Watchlist'; } ],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./watchlist.controller');
          $ocLazyLoad.load({ name: 'ept.watchlist.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      pageData: ['Watchlist', '$stateParams', function(Watchlist, $stateParams) {
        var query = { limit: Number($stateParams.limit) || 25 };
        return Watchlist.index(query).$promise;
      }]
    }
  });

  $stateProvider.state('watchlist.edit', {
    parent: 'public-layout',
    url: '/watchlist/edit',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'WatchlistEditCtrl',
        controllerAs: 'WatchlistEditCtrl',
        templateUrl: '/static/templates/watchlist/watchlist.edit.html'
      }
    },
    resolve: {
      $title: [ function() { return 'Edit Watchlist'; } ],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./watchlist.edit.controller');
          $ocLazyLoad.load({ name: 'ept.watchlist.edit.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      pageData: ['Watchlist', '$stateParams', function(Watchlist, $stateParams) {
        var query = { limit: Number($stateParams.limit) || 10 };
        return Watchlist.edit(query).$promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.watchlist', ['ui.router'])
.config(route)
.name;
