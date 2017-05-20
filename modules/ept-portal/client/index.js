var ctrl = require('./portal.controller.js');

var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('portal', {
    parent: 'public-layout',
    views: {
      'content': {
        controller: 'PortalCtrl',
        controllerAs: 'PortalCtrl',
        template: require('./portal.html')
      }
    },
    resolve: {
      $title: function() { return 'Home'; },
      pageData: ['Portal', function(Portal) {
        return Portal.query().$promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.portal', ['ui.router'])
.config(route)
.controller('PortalCtrl', ctrl)
.name;
