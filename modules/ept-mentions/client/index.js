var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('mentions', {
    parent: 'public-layout',
    url: '/mentions?page&limit',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'MentionsCtrl',
        controllerAs: 'MentionsCtrl',
        templateUrl: '/static/templates/modules/ept-mentions/mentions.html'
      }
    },
    resolve: {
      $title: [ function() { return 'Watchlist'; } ],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./mentions.controller');
          $ocLazyLoad.load({ name: 'ept.mentions.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      // pageData: ['NotificationSvc', function(NotificationSvc) {
      //   return NotificationSvc.getMentionsList;
      // }]
    }
  });

}];

module.exports = angular.module('ept.mentions', ['ui.router'])
.config(route)
.name;
