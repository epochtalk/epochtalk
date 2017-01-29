var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('newThread', {
    url: '/boards/{boardId}/threads/new',
    parent: 'public-layout',
    views: {
      'content': {
        controller: 'NewThreadCtrl',
        controllerAs: 'NewThreadCtrl',
        templateUrl: '/static/templates/threads/new/new.html'
      }
    },
    resolve: {
      $title: function() { return 'Create New Thread'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./new.controller');
          $ocLazyLoad.load([
            { name: 'ept.newThread.ctrl' },
            { name: 'ept.directives.poll-creator' },
            { name: 'ept.directives.co-owners' },
            { name: 'ept.directives.image-uploader' },
            { name: 'ept.directives.epochtalk-editor' },
            { name: 'ept.directives.username-exists' }
          ]);
          deferred.resolve();
        });
        return deferred.promise;
      }],
      authCheck: ['$q', 'Session', function($q, Session) {
        var authed = Session.isAuthenticated();
        if (authed) { return authed; }
        else { return $q.reject({ status: 401, statusText: 'Unauthorized' }); }
      }]
    }
  });
}];

module.exports = angular.module('ept.newThread', ['ui.router'])
.config(route)
.name;