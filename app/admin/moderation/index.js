module.exports = ['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  // Checks if user is an admin
  var adminCheck = function(route) {
    return ['$q', 'Session', function($q, Session) {
      if (!Session.isAuthenticated()) {  return $q.reject({ status: 401, statusText: 'Unauthorized' }); }
      if (route && Session.hasPermission('adminAccess' + '.' + route)) { return true; }
      else if (!route && Session.hasPermission('adminAccess')) { return true; }
      else { return $q.reject({ status: 403, statusText: 'Forbidden' }); }
    }];
  };

  // Checks if user is a moderator
  var modCheck = function(route) {
    return ['$q', 'Session', function($q, Session) {
      if (!Session.isAuthenticated()) {  return $q.reject({ status: 401, statusText: 'Unauthorized' }); }


      if (route && Session.hasPermission('modAccess' + '.' + route)) { return true; }
      else if (!route && Session.hasPermission('modAccess')) { return true; }
      else { return $q.reject({ status: 403, statusText: 'Forbidden' }); }
    }];
  };

  var moderationRedirect = ['$state', 'Session', function($state, Session) {
    if (Session.hasPermission('modAccess.users')) {
      $state.go('admin-moderation.users', { filter: 'Pending'}, { location: true, reload: true });
    }
    else if (Session.hasPermission('modAccess.posts')) {
      $state.go('admin-moderation.posts', { filter: 'Pending'}, { location: true, reload: true });
    }
    else if (Session.hasPermission('modAccess.messages')) {
      $state.go('admin-moderation.messages', { filter: 'Pending'}, { location: true, reload: true });
    }
    else { $state.go('admin'); }
  }];

  $urlRouterProvider.when('/admin/moderation', moderationRedirect);
  $urlRouterProvider.when('/admin/moderation/', moderationRedirect);

  $stateProvider.state('admin-moderation', {
    url: '/admin/moderation',
    parent: 'admin-layout',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: ['Session', function(Session) {
          this.hasPermission = Session.hasPermission;
          this.tab = null;
          if (Session.hasPermission('modAccess.users')) { this.tab = 'users'; }
          else if (Session.hasPermission('modAccess.posts')) { this.tab = 'posts'; }
          else if (Session.hasPermission('modAccess.messages')) { this.tab = 'messages'; }
        }],
        controllerAs: 'ModerationCtrl',
        templateUrl: '/static/templates/admin/moderation/index.html'
      }
    },
    resolve: { userAccess: modCheck() }
  })
  .state('admin-moderation.users', {
    url: '/users?page&limit&field&desc&filter&search&reportId',
    reloadOnSearch: false,
    views: {
      'data@admin-moderation': {
        controller: 'ModUsersCtrl',
        controllerAs: 'ModerationCtrl',
        templateUrl: '/static/templates/admin/moderation/users.html'
      }
    },
    resolve: {
      userAccess: modCheck('users'),
      $title: function() { return 'User Moderation'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./users.controller');
          $ocLazyLoad.load({ name: 'ept.admin.moderation.users.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      reportId: ['$stateParams', function($stateParams) {
        return $stateParams.reportId;
      }],
      userReports: ['AdminReports', '$stateParams', function(AdminReports, $stateParams) {
        var query = {
          field: $stateParams.field,
          desc: $stateParams.desc || true,
          filter: $stateParams.filter,
          limit: Number($stateParams.limit) || 15,
          page: Number($stateParams.page) || 1,
          search: $stateParams.search
        };
        return AdminReports.pageUserReports(query).$promise;
      }]
    }
  })
  .state('admin-moderation.users.preview', {
    reloadOnSearch: false,
    params: { username: { value: undefined } },
    views: {
      'preview@admin-moderation.users': {
        controller: 'ProfileCtrl',
        controllerAs: 'ProfileCtrl',
        templateUrl: '/static/templates/users/profile/profile.html'
      }
    },
    resolve: {
      $title: ['$stateParams', function($stateParams) { return $stateParams.username; }],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('../../users/profile/profile.controller');
          $ocLazyLoad.load({ name: 'ept.profile.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      user: [ 'AdminUsers', '$stateParams', function(AdminUsers, $stateParams) {
        return AdminUsers.find({ username: $stateParams.username }).$promise;
      }]
    }
  })
  .state('admin-moderation.posts', {
    url: '/posts?page&limit&field&desc&filter&search&reportId&allReports',
    reloadOnSearch: false,
    views: {
      'data@admin-moderation': {
        controller: 'ModPostsCtrl',
        controllerAs: 'ModerationCtrl',
        templateUrl: '/static/templates/admin/moderation/posts.html'
      }
    },
    resolve: {
      userAccess: modCheck('posts'),
      $title: function() { return 'Post Moderation'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./posts.controller');
          $ocLazyLoad.load({ name: 'ept.admin.moderation.posts.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      reportId: ['$stateParams', function($stateParams) {
        return $stateParams.reportId;
      }],
      allReports: ['$stateParams', function($stateParams) {
        return $stateParams.allReports;
      }],
      postReports: ['AdminReports', '$stateParams', 'Session', function(AdminReports, $stateParams, Session) {
        var query = {
          field: $stateParams.field,
          desc: $stateParams.desc || true,
          filter: $stateParams.filter,
          limit: Number($stateParams.limit) || 15,
          page: Number($stateParams.page) || 1,
          search: $stateParams.search,
          mod_id: $stateParams.allReports === 'true' ? undefined : Session.user.id
        };
        if (Session.globalModeratorCheck()) { delete query.mod_id; } // default to all if global mod
        return AdminReports.pagePostReports(query).$promise;
      }]
    }
  })
  .state('admin-moderation.messages', {
    url: '/messages?page&limit&field&desc&filter&search&reportId',
    reloadOnSearch: false,
    views: {
      'data@admin-moderation': {
        controller: 'ModMessagesCtrl',
        controllerAs: 'ModerationCtrl',
        templateUrl: '/static/templates/admin/moderation/messages.html'
      }
    },
    resolve: {
      userAccess: modCheck('messages'),
      $title: function() { return 'Messages Moderation'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./messages.controller');
          $ocLazyLoad.load({ name: 'ept.admin.moderation.messages.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      reportId: ['$stateParams', function($stateParams) {
        return $stateParams.reportId;
      }],
      messageReports: ['AdminReports', '$stateParams', function(AdminReports, $stateParams) {
        var query = {
          field: $stateParams.field,
          desc: $stateParams.desc || true,
          filter: $stateParams.filter,
          limit: Number($stateParams.limit) || 15,
          page: Number($stateParams.page) || 1,
          search: $stateParams.search
        };
        return AdminReports.pageMessageReports(query).$promise;
      }]
    }
  });
}];
