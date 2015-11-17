var ctrl = require('./boards.controller.js');

var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('boards', {
    url: '/',
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
