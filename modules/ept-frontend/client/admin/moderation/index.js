module.exports = ['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

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
      $state.go('admin-moderation.users', { filter: 'Pending'}, { location: 'replace' });
    }
    else if (Session.hasPermission('modAccess.posts')) {
      $state.go('admin-moderation.posts', { filter: 'Pending'}, { location: 'replace' });
    }
    else if (Session.hasPermission('modAccess.messages')) {
      $state.go('admin-moderation.messages', { filter: 'Pending'}, { location: 'replace' });
    }
    else if (Session.hasPermission('modAccess.logs')) {
      $state.go('admin-moderation.logs', {}, {location: 'replace'});
    }
    else if (Session.hasPermission('modAccess.boardBans')) {
      $state.go('admin-moderation.board-bans', {}, {location: 'replace'});
    }
    else { $state.go('home', {}, {location: 'replace'}); }
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
          else if (Session.hasPermission('modAccess.logs')) { this.tab = 'logs'; }
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
          require('./users.controller');
          $ocLazyLoad.load([
            { name: 'ept.admin.moderation.users.ctrl' },
            { name: 'ept.directives.image-uploader' },
            { name: 'ept.directives.profile'},
            { name: 'ept.directives.usernotes'}
          ]);
          deferred.resolve();
        });
        return deferred.promise;
      }],
      reportId: ['$stateParams', function($stateParams) {
        return $stateParams.reportId;
      }],
      userReports: ['Reports', '$stateParams', function(Reports, $stateParams) {
        var query = {
          field: $stateParams.field,
          desc: $stateParams.desc || true,
          filter: $stateParams.filter,
          limit: Number($stateParams.limit) || 15,
          page: Number($stateParams.page) || 1,
          search: $stateParams.search
        };
        return Reports.pageUserReports(query).$promise;
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
          require('./posts.controller');
          $ocLazyLoad.load([
            { name: 'ept.admin.moderation.posts.ctrl' },
            { name: 'ept.directives.epochtalk-editor' },
            { name: 'ept.directives.image-uploader' },
            { name: 'ept.directives.resizeable' }
          ]);
          deferred.resolve();
        });
        return deferred.promise;
      }],
      reportId: ['$stateParams', function($stateParams) {
        return $stateParams.reportId;
      }],
      allReports: ['$stateParams', function($stateParams) {
        return $stateParams.allReports;
      }],
      postReports: ['Reports', '$stateParams', 'Session', function(Reports, $stateParams, Session) {
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
        return Reports.pagePostReports(query).$promise;
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
          require('./messages.controller');
          $ocLazyLoad.load([
            { name: 'ept.admin.moderation.messages.ctrl' }
          ]);
          deferred.resolve();
        });
        return deferred.promise;
      }],
      reportId: ['$stateParams', function($stateParams) {
        return $stateParams.reportId;
      }],
      messageReports: ['Reports', '$stateParams', function(Reports, $stateParams) {
        var query = {
          field: $stateParams.field,
          desc: $stateParams.desc || true,
          filter: $stateParams.filter,
          limit: Number($stateParams.limit) || 15,
          page: Number($stateParams.page) || 1,
          search: $stateParams.search
        };
        return Reports.pageMessageReports(query).$promise;
      }]
    }
  })
  .state('admin-moderation.board-bans', {
    url: '/boardbans?page&limit&board&modded&search',
    reloadOnSearch: false,
    views: {
      'data@admin-moderation': {
        controller: 'ModBoardBansCtrl',
        controllerAs: 'ModerationCtrl',
        templateUrl: '/static/templates/admin/moderation/board-bans.html'
      }
    },
    resolve: {
      userAccess: modCheck('boardBans'),
      $title: function() { return 'Board Bans'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./board-bans.controller');
          $ocLazyLoad.load([
            { name: 'ept.admin.moderation.boardBans.ctrl' },
            { name: 'ept.directives.autocomplete-username'}
          ]);
          deferred.resolve();
        });
        return deferred.promise;
      }],
      bannedBoards: [ 'Bans', '$stateParams', function(Bans, $stateParams) {
        var query = {
          limit: Number($stateParams.limit) || undefined,
          page: Number($stateParams.page) || undefined,
          modded: $stateParams.modded,
          board: $stateParams.board,
          search: $stateParams.search
        };
        return Bans.byBannedBoards(query).$promise;
      }],
      selectBoards: ['Boards', '$filter', function(Boards, $filter) {
        return Boards.moveList().$promise
        .then(function(allBoards) {
          allBoards = allBoards || [];
          allBoards.map(function(board) {
            board.name = $filter('decode')(board.name); // decode html entities
          });
          return allBoards;
        });
      }],
      boards: ['Boards', function(Boards) {
        return Boards.query({ stripped: true }).$promise
        .then(function(data) { return data.boards; });
      }]
    }
  })
  .state('admin-moderation.logs', {
    url: '/logs?page&limit&mod&action&keyword&bdate&adate&sdate&edate',
    reloadOnSearch: false,
    views: {
      'data@admin-moderation': {
        controller: 'ModLogsCtrl',
        controllerAs: 'ModerationCtrl',
        templateUrl: '/static/templates/admin/moderation/logs.html'
      }
    },
    resolve: {
      userAccess: modCheck('logs'),
      $title: function() { return 'Moderation Log'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./logs.controller');
          $ocLazyLoad.load({ name: 'ept.admin.moderation.logs.ctrl' });
          deferred.resolve();
        });
        return deferred.promise;
      }],
      moderationLogs: ['ModerationLogs', '$stateParams', function(ModerationLogs, $stateParams) {
        var query = {
          limit: Number($stateParams.limit) || undefined,
          page: Number($stateParams.page) || undefined,
          mod: $stateParams.mod,
          action: $stateParams.action,
          keyword: $stateParams.keyword,
          bdate: $stateParams.bdate,
          adate: $stateParams.adate,
          sdate: $stateParams.sdate,
          edate: $stateParams.edate
        };
        return ModerationLogs.page(query).$promise;
      }]
    }
  });
}];
