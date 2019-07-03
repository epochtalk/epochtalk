var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('messages', {
    url: '/messages',
    parent: 'public-layout',
    views: {
      'content': {
        controller: 'MessagesCtrl',
        controllerAs: 'MessagesCtrl',
        template: require('./messages.html')
      }
    },
    resolve: {
      $title: function() { return 'Private Messages'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./messages.controller');
          $ocLazyLoad.load([
            { name: 'ept.messages.ctrl' },
            { name: 'ept.directives.epochtalk-editor' },
            { name: 'ept.directives.image-uploader' },
            { name: 'ept.directives.resizeable' }
          ]);
          deferred.resolve();
        });
        return deferred.promise;
      }],
      pageData: ['Session', 'Alert', 'Messages', '$q', function(Session, Alert, Messages, $q) {
        if (Session.isAuthenticated() && Session.hasPermission('messages.latest.allow')) {
          return Messages.latest().$promise;
        }
        else { return $q.reject({ status: 401, statusText: 'Unauthorized' }); }
      }]
    }
  });
}];

module.exports = angular.module('ept.messages', ['ui.router'])
.config(route)
.name;
