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
      $title: [ function() { return 'Mentions'; } ],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./mentions.controller');
          $ocLazyLoad.load({ name: 'ept.mentions.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      pageData: ['Mentions', '$stateParams', function(Mentions, $stateParams) {
        var page = Number($stateParams.page);
        // Only supply page query param if above page 1
        page = page > 1 ? page : undefined;
        var query = {
          page: page,
          limit: Number($stateParams.limit) || 25,
          extended: true
        };
        return Mentions.page(query).$promise;
      }]
    }
  });

}];

module.exports = angular.module('ept.mentions', ['ui.router'])
.config(route)
.name;
