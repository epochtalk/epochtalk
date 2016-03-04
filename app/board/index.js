var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('board', {
    parent: 'public-layout',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: [function(){}],
        controllerAs: 'BoardWrapperCtrl',
        templateUrl: '/static/templates/board/board.html'
      }
    }
  })
  .state('board.data', {
    url: '/boards/{boardId}?limit&page',
    reloadOnSearch: false,
    views: {
      'data@board': {
        controller: 'BoardCtrl',
        controllerAs: 'BoardCtrl',
        templateUrl: '/static/templates/board/board.data.html'
      }
    },
    resolve: {
      $title: ['pageData', function(pageData) { return pageData.board.name; }],
      $boardBanned: ['pageData', function(pageData) { return pageData.bannedFromBoard; }],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./board.controller');
          $ocLazyLoad.load({ name: 'ept.board.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      pageData: ['Threads', '$stateParams', function(Threads, $stateParams) {
        var query = {
          board_id: $stateParams.boardId,
          limit: Number($stateParams.limit) || 25,
          page: Number($stateParams.page) || 1
        };
        return Threads.byBoard(query).$promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.board', ['ui.router'])
.config(route)
.name;
