var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('ad-info', {
    parent: 'public-layout',
    url: '/ads/info',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'AdInfoCtrl',
        controllerAs: 'AdInfoCtrl',
        templateUrl: '/static/templates/modules/ept-ads/info.html'
      }
    },
    resolve: {
      $title: [ function() { return 'Advertisement Information'; } ],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./info.controller');
          $ocLazyLoad.load({ name: 'ept.ads.info.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      pageData: ['Ads', function(Ads) {
        return Ads.roundInfo().$promise;
      }]
    }
  });

  $stateProvider.state('ad-analytics', {
    parent: 'public-layout',
    url: '/ads/analytics',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'AdAnalyticsCtrl',
        controllerAs: 'AdAnalyticsCtrl',
        templateUrl: '/static/templates/modules/ept-ads/analytics.html'
      }
    },
    resolve: {
      $title: [ function() { return 'Ad Analytics'; } ],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./analytics.controller');
          $ocLazyLoad.load({ name: 'ept.ads.analytics.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      pageData: ['Ads', function(Ads) {
        return Ads.analytics({round:'current'}).$promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.ads', ['ui.router'])
.config(route)
.name;
