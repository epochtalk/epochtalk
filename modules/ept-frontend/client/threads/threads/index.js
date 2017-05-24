var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('threads', {
    parent: 'public-layout',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: [function(){}],
        controllerAs: 'ThreadsWrapperCtrl',
        templateUrl: '/static/templates/threads/threads/threads.html'
      }
    }
  })
  .state('threads.data', {
    url: '/boards/{boardId}?limit&page',
    reloadOnSearch: false,
    views: {
      'data@threads': {
        controller: 'ThreadsCtrl',
        controllerAs: 'ThreadsCtrl',
        templateUrl: '/static/templates/threads/threads/threads.data.html'
      }
    },
    resolve: {
      $title: ['pageData', function(pageData) { return pageData.board.name; }],
      $boardBanned: ['pageData', function(pageData) { return pageData.banned_from_board; }],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./threads.controller');
          $ocLazyLoad.load([
            { name: 'ept.threads.ctrl' },
            { name: 'ept.directives.setModerators' }
          ]);
          deferred.resolve();
        });
        return deferred.promise;
      }],
      pageData: ['Threads', 'PreferencesSvc', '$stateParams', function(Threads, PreferencesSvc, $stateParams) {
        var prefs = PreferencesSvc.preferences;
        var query = {
          board_id: $stateParams.boardId,
          limit: Number($stateParams.limit) || prefs.threads_per_page || 25,
          page: Number($stateParams.page) || 1
        };
        return Threads.byBoard(query).$promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.threads', ['ui.router'])
.config(route)
.name;
