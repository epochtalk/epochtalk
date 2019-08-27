var ctrl = require('./boards.controller.js');

var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('boards', {
    url: '/boards',
    parent: 'public-layout',
    views: {
      'content': {
        controller: 'BoardsCtrl',
        controllerAs: 'BoardsCtrl',
        template: require('./boards.html')
      }
    },
    resolve: {
      $title: function() { return 'Home'; },
      $className: function() { return 'boards'; },
      pageData: ['Boards', function(Boards) {
        return Boards.query().$promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.boards', ['ui.router'])
.config(route)
.controller('BoardsCtrl', ctrl)
.name;
