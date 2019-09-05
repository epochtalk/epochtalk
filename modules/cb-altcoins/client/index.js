var ctrl = require('./altcoins.controller.js');

var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('altcoins', {
    parent: 'public-layout',
    url: '/altcoins',
    views: {
      'content': {
        controller: 'AltcoinsCtrl',
        controllerAs: 'AltcoinsCtrl',
        template: require('./altcoins.html')
      }
    },
    resolve: {
      $title: function() { return 'Altcoins'; },
      projects: ['Altcoins', function(Altcoins) {
        return Altcoins.allProjects().$promise;
      }]
    }
  });
}];

module.exports = angular.module('cb.altcoins', ['ui.router'])
.config(route)
.controller('AltcoinsCtrl', ctrl)
.name;
