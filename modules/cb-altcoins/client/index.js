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
      $title: function() { return 'Home'; },
      altcoins: ['$http', 'Session', function($http, Session) {
        if (Session.isAuthenticated()) {
          let requestData = {
            method: 'GET',
            url: 'https://api.coingecko.com/api/v3/exchanges/list',
            headers: { 'Accept': 'application/json' }
          }
          return $http(requestData)
          .then(
            function success(req) { return req.data; },
            function error(err) { console.log(err) }
          );
        }
        else { return; }
      }]
    }
  });
}];

module.exports = angular.module('cb.altcoins', ['ui.router'])
.config(route)
.controller('AltcoinsCtrl', ctrl)
.name;
