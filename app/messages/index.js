var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('messages', {
    url: '/messages',
    parent: 'public-layout',
    views: {
      'content': {
        controller: 'MessagesCtrl',
        controllerAs: 'MessagesCtrl',
        templateUrl: '/static/templates/messages/messages.html'
      }
    },
    resolve: {
      userAccess: ['$q', 'Session', function($q, Session) {
        if (Session.isAuthenticated) { return true; }
        else { return $q.reject('Unauthorized'); }
      }],
      $title: function() { return 'Private Messages'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./messages.controller');
          $ocLazyLoad.load({ name: 'ept.messages.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      pageData: ['Messages', function(Messages) { return Messages.latest().$promise; }]
    }
  });
}];

module.exports = angular.module('ept.messages', ['ui.router'])
.config(route)
.name;
