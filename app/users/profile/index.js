var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('profile', {
    url: '/profiles/{username}',
    parent: 'public-layout',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'ProfileCtrl',
        controllerAs: 'ProfileCtrl',
        templateUrl: '/static/templates/users/profile/profile.html'
      }
    },
    resolve: {
      $title: ['user', function(user) { return user.username; }],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./profile.controller');
          $ocLazyLoad.load({ name: 'ept.profile.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      user: ['AdminUsers', 'Session', 'User', '$stateParams', function(AdminUsers, Session, User, $stateParams) {
        var promise;
        if (Session.hasPermission('adminUsers.find')) {
          promise = AdminUsers.find({ username: $stateParams.username }).$promise;
        }
        else { promise = User.get({ id: $stateParams.username }).$promise; }
        return promise.then(function(user) { return user; });
      }]
    }
  })
  .state('profile.posts', {
    url: '?limit&page&field&desc',
    reloadOnSearch: false,
    views: {
      'posts@profile': {
        controller: 'ProfilePostsCtrl',
        controllerAs: 'ProfilePostsCtrl',
        templateUrl: '/static/templates/users/profile/posts.html'
      }
    },
    resolve: {
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./posts.controller');
          $ocLazyLoad.load({ name: 'ept.profile.postsCtrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      pageData: ['Posts', '$stateParams', function(Posts, $stateParams) {
        var params = {
          username: $stateParams.username,
          field: $stateParams.field,
          desc: $stateParams.desc || true,
          limit: Number($stateParams.limit) || 25,
          page: Number($stateParams.page) || 1
        };
        return Posts.pageByUser(params).$promise;
      }]
    }
  });

  $stateProvider.state('users-posts', {
    url: '/profiles/{username}/posts?limit&page&field&desc',
    parent: 'public-layout',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'ProfilePostsCtrl',
        controllerAs: 'ProfilePostsCtrl',
        templateUrl: '/static/templates/users/profile/posts.html'
      }
    },
    resolve: {
      $title: ['$stateParams', function($stateParams) {
        return 'Posts by ' + $stateParams.username;
      }],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./posts.controller');
          $ocLazyLoad.load({ name: 'ept.profile.postsCtrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      user: [ 'User', '$stateParams', function(User, $stateParams) {
        return User.get({ id: $stateParams.username }).$promise
        .then(function(user) { return user; });
      }],
      pageData: ['Posts', '$stateParams', function(Posts, $stateParams) {
        var params = {
          username: $stateParams.username,
          field: $stateParams.field,
          desc: $stateParams.desc || true,
          limit: Number($stateParams.limit) || 25,
          page: Number($stateParams.page) || 1
        };
        return Posts.pageByUser(params).$promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.profile', ['ui.router'])
.config(route)
.name;
