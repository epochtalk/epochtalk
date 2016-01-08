var ctrl = require('./category.controller.js');

var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('category', {
    url: '/categories/{categoryId}',
    parent: 'public-layout',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'CategoryCtrl',
        controllerAs: 'CategoryCtrl',
        templateUrl: '/static/templates/category/category.html'
      }
    },
    resolve: {
      $title: function() { return 'Repos for github' },
      boardsByCategory: ['Boards', '$stateParams', function(Boards, $stateParams) {
        var query = {
          category_id: $stateParams.categoryId
        };
        return Boards.byCategory(query).$promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.category', ['ui.router'])
.config(route)
.controller('CategoryCtrl', ctrl)
.name;
