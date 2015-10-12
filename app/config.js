var _ = require('lodash');
var fs = require('fs');
require('./filters');
require('./services');
require('./resources');

module.exports = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 'cfpLoadingBarProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, cfpLoadingBarProvider) {
    // Public layout
    $stateProvider.state('public-layout', {
      views: {
        'header': { template: fs.readFileSync(__dirname + '/layout/header.html') },
        'body': { template: fs.readFileSync(__dirname + '/layout/public-content.html') },
        'footer': { template: fs.readFileSync(__dirname + '/layout/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/layout/modals.html') }
      }
    });

    // Admin layout
    $stateProvider.state('admin-layout', {
      views: {
        'header': { template: fs.readFileSync(__dirname + '/layout/header.admin.html') },
        'body': { template: fs.readFileSync(__dirname + '/layout/admin-content.html') }
      }
    });

    $stateProvider.state('profile', {
      url: '/profiles/{username}',
      parent: 'public-layout',
      reloadOnSearch: false,
      views: {
        'content': {
          controller: 'ProfileCtrl',
          controllerAs: 'ProfileCtrl',
          template: fs.readFileSync(__dirname + '/user/profile.html')
        }
      },
      resolve: {
        $title: ['user', function(user) { return user.username; }],
        user: ['AdminUsers', 'Session', 'User', '$stateParams', function(AdminUsers, Session, User, $stateParams) {
          var promise;
          if (Session.hasPermission('profileControls.viewUserEmail')) {
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
          template: fs.readFileSync(__dirname + '/user/posts.html')
        }
      },
      resolve: {
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
          template: fs.readFileSync(__dirname + '/user/posts.html')
        }
      },
      resolve: {
        $title: ['$stateParams', function($stateParams) {
          return 'Posts by ' + $stateParams.username;
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

    $stateProvider.state('confirm', {
      url: '/confirm/{username}/{token}',
      parent: 'public-layout',
      views: {
        'content': {
          controller: 'ConfirmCtrl',
          controllerAs: 'ConfirmCtrl',
          template: fs.readFileSync(__dirname + '/user/confirm.html')
        }
      },
      resolve: {
        $title: ['$stateParams', function($stateParams) {
          return 'Confirm Account ' + $stateParams.username;
        }]
      }
    });

    $stateProvider.state('reset', {
      url: '/reset/{username}/{token}',
      parent: 'public-layout',
      views: {
        'content': {
          controller: 'ResetCtrl',
          controllerAs: 'ResetCtrl',
          template: fs.readFileSync(__dirname + '/user/reset.html')
        }
      },
      resolve: {
        $title: ['$stateParams', function($stateParams) {
          return 'Reset Password ' + $stateParams.username;
        }]
      }
    });

    $stateProvider.state('boards', {
      url: '/',
      parent: 'public-layout',
      views: {
        'content': {
          controller: 'BoardsCtrl',
          controllerAs: 'BoardsCtrl',
          template: fs.readFileSync(__dirname + '/boards/boards.html')
        }
      },
      resolve: {
        $title: function() { return 'Home'; },
        boards: ['Boards', function(Boards) {
          return Boards.query().$promise
          .then(function(categorizedBoards) { return categorizedBoards; });
        }]
      }
    });

    $stateProvider.state('board', {
      parent: 'public-layout',
      reloadOnSearch: false,
      views: {
        'content': {
          controller: [function(){}],
          controllerAs: 'BoardWrapperCtrl',
          template: fs.readFileSync(__dirname + '/board/board.html')
        }
      }
    })
    .state('board.data', {
      url: '/boards/{boardId}?limit&page',
      reloadOnSearch: false,
      views: {
        'data@board': {
          controller: 'BoardCtrl',
          controllerAs: 'BoardCtrl',
          template: fs.readFileSync(__dirname + '/board/board.data.html')
        }
      },
      resolve: {
        $title: ['pageData', function(pageData) { return pageData.board.name; }],
        pageData: ['Threads', '$stateParams', function(Threads, $stateParams) {
          var query = {
            board_id: $stateParams.boardId,
            limit: Number($stateParams.limit) || 25,
            page: Number($stateParams.page) || 1
          };
          return Threads.byBoard(query).$promise
          .then(function(data) { return data; });
        }]
      }
    });

    $stateProvider.state('newThread', {
      url: '/boards/{boardId}/threads/new',
      parent: 'public-layout',
      views: {
        'content': {
          controller: 'NewThreadCtrl',
          controllerAs: 'NewThreadCtrl',
          template: fs.readFileSync(__dirname + '/board/new-thread.html')
        }
      },
      resolve: {
        $title: function() { return 'Create New Thread'; }
      }
    });

    $stateProvider.state('posts', {
      parent: 'public-layout',
      reloadOnSearch: false,
      views: {
        'content': {
          controller: 'PostsParentCtrl',
          controllerAs: 'PostsParentCtrl',
          template: fs.readFileSync(__dirname + '/posts/posts.html')
        }
      }
    })
    .state('posts.data', {
      url: '/threads/{threadId}/posts?limit&page&start',
      reloadOnSearch: false,
      views: {
        'data@posts': {
          controller: 'PostsCtrl',
          controllerAs: 'PostsCtrl',
          template: fs.readFileSync(__dirname + '/posts/posts.data.html')
        }
      },
      resolve: {
        $title: ['pageData', function(pageData) { return pageData.thread.title; }],
        pageData: ['Posts', 'Threads', '$stateParams', function(Posts, Threads, $stateParams) {
          var query = {
            thread_id: $stateParams.threadId,
            page: $stateParams.page,
            limit: $stateParams.limit,
            start: $stateParams.start
          };
          Threads.viewed({ id: $stateParams.threadId });
          return Posts.byThread(query).$promise;
        }]
      }
    });

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

    var adminRedirect = ['$state', 'Session', function($state, Session) {
      if (Session.hasPermission('adminAccess.settings')) { $state.go('admin-settings'); }
      else if (Session.hasPermission('adminAccess.management')) { $state.go('admin-management'); }
      else if (Session.hasPermission('modAccess')) { $state.go('admin-moderation'); }
      else { $state.go('boards'); }
    }];

    $urlRouterProvider.when('/admin', adminRedirect);
    $urlRouterProvider.when('/admin/', adminRedirect);

    $stateProvider.state('admin', {
      url: '/admin',
      parent: 'admin-layout',
      resolve: { userAccess: modCheck() || adminCheck() }
    });

    var adminSettingsRedirect = ['$state', 'Session', function($state, Session) {
      if (Session.hasPermission('adminAccess.settings.general')) { $state.go('admin-settings.general'); }
      else if (Session.hasPermission('adminAccess.settings.forum')) { $state.go('admin-settings.forum'); }
      else { $state.go('admin'); }
    }];

    $urlRouterProvider.when('/admin/settings', adminSettingsRedirect);
    $urlRouterProvider.when('/admin/settings/', adminSettingsRedirect);

    $stateProvider.state('admin-settings', {
      url: '/admin/settings',
      parent: 'admin-layout',
      views: {
        'content': {
          controller: ['$scope', 'Session', function($scope, Session) {
            this.hasPermission = Session.hasPermission;
            this.tab = null;
            if (Session.hasPermission('adminAccess.settings.general')) { this.tab = 'general'; }
            else if (Session.hasPermission('adminAccess.settings.forum')) { this.tab = 'users'; }
            $scope.child = {};
          }],
          controllerAs: 'AdminSettingsCtrl',
          template: fs.readFileSync(__dirname + '/admin/settings/index.html')
        }
      },
      resolve: {
        userAccess: adminCheck('settings'),
        settings: ['AdminSettings', function(AdminSettings) {
          return AdminSettings.get().$promise
          .then(function(settings) {
            // Remove unsettable configs
            delete settings.db;
            delete settings.rootDir;
            return settings;
          });
        }]
      }
    })
    .state('admin-settings.general', {
      url: '/general',
      views: {
        'data@admin-settings': {
          controller: 'GeneralSettingsCtrl',
          controllerAs: 'AdminSettingsCtrl',
          template: fs.readFileSync(__dirname + '/admin/settings/general.html')
        }
      },
      resolve: {
        userAccess: adminCheck('settings.general'),
        $title: function() { return 'General Settings'; }
      }
    })
    .state('admin-settings.forum', {
      url: '/forum',
      views: {
        'data@admin-settings': {
          controller: 'ForumSettingsCtrl',
          controllerAs: 'AdminSettingsCtrl',
          template: fs.readFileSync(__dirname + '/admin/settings/forum.html')
        }
      },
      resolve: {
        userAccess: adminCheck('settings.forum'),
        $title: function() { return 'Forum Settings'; }
      }
    });

    var adminManagementRedirect = ['$state', 'Session', function($state, Session) {
      if (Session.hasPermission('adminAccess.management.boards')) { $state.go('admin-management.boards'); }
      else if (Session.hasPermission('adminAccess.management.users')) { $state.go('admin-management.users'); }
      else if (Session.hasPermission('adminAccess.management.roles')) { $state.go('admin-management.roles'); }
      else { $state.go('admin'); }
    }];

    // Default child state for admin-management is users
    $urlRouterProvider.when('/admin/management', adminManagementRedirect);
    $urlRouterProvider.when('/admin/management/', adminManagementRedirect);

    $stateProvider.state('admin-management', {
      url: '/admin/management',
      reloadOnSearch: false,
      parent: 'admin-layout',
      views: {
        'content': {
          controller: ['Session', function(Session) {
            this.hasPermission = Session.hasPermission;
            this.tab = null;
            if (Session.hasPermission('adminAccess.management.boards')) { this.tab = 'boards'; }
            else if (Session.hasPermission('adminAccess.management.users')) { this.tab = 'users'; }
            else if (Session.hasPermission('adminAccess.management.roles')) { this.tab = 'roles'; }
          }],
          controllerAs: 'AdminManagementCtrl',
          template: fs.readFileSync(__dirname + '/admin/management/index.html')
        }
      },
      resolve: { userAccess: adminCheck('management') }
    })
    .state('admin-management.boards', {
      url: '/boards?saved',
      views: {
        'data@admin-management': {
          controller: 'CategoriesCtrl',
          controllerAs: 'AdminManagementCtrl',
          template: fs.readFileSync(__dirname + '/admin/management/boards.html')
        }
      },
      resolve: {
        userAccess: adminCheck('management.boards'),
        $title: function() { return 'Board Management'; },
        categories: ['Boards', function(Boards) {
          return Boards.query().$promise
          .then(function(categories) { return categories; });
        }],
        boards: ['Boards', function(Boards) {
          return Boards.all().$promise
          .then(function(boards) {return boards; });
        }]
      }
    })
    .state('admin-management.users', {
      url: '/users?page&limit&field&desc&filter&search',
      reloadOnSearch: false,
      views: {
        'data@admin-management': {
          controller: 'UsersCtrl',
          controllerAs: 'AdminManagementCtrl',
          template: fs.readFileSync(__dirname + '/admin/management/users.html')
        }
      },
      resolve: {
        userAccess: adminCheck('management.users'),
        $title: function() { return 'User Management'; },
        users: ['AdminUsers', '$stateParams', function(AdminUsers, $stateParams) {
          var query = {
            field: $stateParams.field,
            desc: $stateParams.desc,
            limit: Number($stateParams.limit) || 15,
            page: Number($stateParams.page) || 1,
            filter: $stateParams.filter,
            search: $stateParams.search
          };
          return AdminUsers.page(query).$promise
          .then(function(users) { return users; });
        }],
        usersCount: ['AdminUsers', '$stateParams', function(AdminUsers, $stateParams) {
          var opts;
          var filter = $stateParams.filter;
          var search = $stateParams.search;
          if (filter || search) {
            opts = {
              filter: filter,
              search: search
            };
          }
          return AdminUsers.count(opts).$promise
          .then(function(usersCount) { return usersCount.count; });
        }],
        field: ['$stateParams', function($stateParams) {
          return $stateParams.field;
        }],
        desc: ['$stateParams', function($stateParams) {
          return $stateParams.desc || false;
        }],
        page: ['$stateParams', function($stateParams) {
          return Number($stateParams.page) || 1;
        }],
        limit: ['$stateParams', function($stateParams) {
          return Number($stateParams.limit) || 15;
        }],
        filter: ['$stateParams', function($stateParams) {
          return $stateParams.filter;
        }],
        search: ['$stateParams', function($stateParams) {
          return $stateParams.search;
        }]
      }
    })
    .state('admin-management.roles', {
      url: '/roles?roleId&page&field&desc&limit&search',
      reloadOnSearch: false,
      views: {
        'data@admin-management': {
          controller: 'RolesCtrl',
          controllerAs: 'AdminManagementCtrl',
          template: fs.readFileSync(__dirname + '/admin/management/roles.html')
        }
      },
      resolve: {
        userAccess: adminCheck('management.roles'),
        $title: function() { return 'Roles Management'; },
        roles: ['AdminRoles', function(AdminRoles) {
          return AdminRoles.all().$promise
          .then(function(roles) { return roles; });
        }],
        page: ['$stateParams', function($stateParams) {
          return Number($stateParams.page) || 1;
        }],
        limit: ['$stateParams', function($stateParams) {
          return Number($stateParams.limit) || 15;
        }],
        roleId: ['$stateParams', function($stateParams) {
          return $stateParams.roleId;
        }],
        search: ['$stateParams', function($stateParams) {
          return $stateParams.search;
        }],
        userData: ['AdminRoles', '$stateParams', function(AdminRoles, $stateParams) {
          var query = {
            id: $stateParams.roleId,
            page: Number($stateParams.page) || 1,
            limit: Number($stateParams.limit) || 15,
            search: $stateParams.search
          };
          return AdminRoles.users(query).$promise
          .then(function(userData) { return userData; });
        }]
      }
    })
    .state('admin-management.moderators', {
      url: '/moderators?page&limit&field&desc',
      views: {
        'data@admin-management': {
          controller: 'ModeratorsCtrl',
          controllerAs: 'AdminManagementCtrl',
          template: fs.readFileSync(__dirname + '/admin/management/moderators.html')
        }
      },
      resolve: {
        userAccess: adminCheck('management'),
        $title: function() { return 'Moderator Management'; },
        moderators: ['AdminUsers', '$stateParams', function(AdminUsers, $stateParams) {
          var query = {
            field: $stateParams.field,
            desc: $stateParams.desc,
            limit: Number($stateParams.limit) || 25,
            page: Number($stateParams.page) || 1
          };
          return AdminUsers.pageModerators(query).$promise
          .then(function(moderators) { return moderators; });
        }],
        moderatorsCount: ['AdminUsers', function(AdminUsers) {
          return AdminUsers.countModerators().$promise
          .then(function(moderatorsCount) { return moderatorsCount.count; });
        }],
        field: ['$stateParams', function($stateParams) {
          return $stateParams.field;
        }],
        desc: ['$stateParams', function($stateParams) {
          return $stateParams.desc || false;
        }],
        page: ['$stateParams', function($stateParams) {
          return Number($stateParams.page) || 1;
        }],
        limit: ['$stateParams', function($stateParams) {
          return Number($stateParams.limit) || 25;
        }]
      }
    })
    .state('admin-management.administrators', {
      url: '/administrators?page&limit&field&desc',
      views: {
        'data@admin-management': {
          controller: 'AdministratorsCtrl',
          controllerAs: 'AdminManagementCtrl',
          template: fs.readFileSync(__dirname + '/admin/management/administrators.html')
        }
      },
      resolve: {
        userAccess: adminCheck('management'),
        $title: function() { return 'Admin Management'; },
        admins: ['AdminUsers', '$stateParams', function(AdminUsers, $stateParams) {
          var query = {
            field: $stateParams.field,
            desc: $stateParams.desc,
            limit: Number($stateParams.limit) || 25,
            page: Number($stateParams.page) || 1
          };
          return AdminUsers.pageAdmins(query).$promise
          .then(function(admins) { return admins; });
        }],
        adminsCount: ['AdminUsers', function(AdminUsers) {
          return AdminUsers.countAdmins().$promise
          .then(function(adminsCount) { return adminsCount.count; });
        }],
        field: ['$stateParams', function($stateParams) {
          return $stateParams.field;
        }],
        desc: ['$stateParams', function($stateParams) {
          return $stateParams.desc || false;
        }],
        page: ['$stateParams', function($stateParams) {
          return Number($stateParams.page) || 1;
        }],
        limit: ['$stateParams', function($stateParams) {
          return Number($stateParams.limit) || 25;
        }]
      }
    });

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
          template: fs.readFileSync(__dirname + '/admin/moderation/index.html')
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
          template: fs.readFileSync(__dirname + '/admin/moderation/users.html')
        }
      },
      resolve: {
        userAccess: modCheck('users'),
        $title: function() { return 'User Moderation'; },
        limit: ['$stateParams', function($stateParams) {
          return $stateParams.limit || 15;
        }],
        page: ['$stateParams', function($stateParams) {
          return Number($stateParams.page) || 1;
        }],
        filter: ['$stateParams', function($stateParams) {
          return $stateParams.filter;
        }],
        field: ['$stateParams', function($stateParams) {
          return $stateParams.field;
        }],
        desc: ['$stateParams', function($stateParams) {
          return $stateParams.desc || true;
        }],
        search: ['$stateParams', function($stateParams) {
          return $stateParams.search;
        }],
        reportId: ['$stateParams', function($stateParams) {
          return $stateParams.reportId;
        }],
        reportCount: ['AdminReports', '$stateParams', function(AdminReports, $stateParams) {
          var opts;
          var status = $stateParams.filter;
          var search = $stateParams.search;
          if (status || search) {
            opts = {
              status: status,
              search: search
            };
          }
          return AdminReports.userReportsCount(opts).$promise
          .then(function(userReportsCount) { return userReportsCount.count; });
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
          return AdminReports.pageUserReports(query).$promise
          .then(function(userReports) { return userReports; });
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
          template: fs.readFileSync(__dirname + '/user/profile.html')
        }
      },
      resolve: {
        $title: ['$stateParams', function($stateParams) {
          return $stateParams.username;
        }],
        user: [ 'User', '$stateParams', function(User, $stateParams) {
          return User.get({ id: $stateParams.username }).$promise
          .then(function(user) { return user; });
        }]
      }
    })
    .state('admin-moderation.posts', {
      url: '/posts?page&limit&field&desc&filter&search&reportId',
      reloadOnSearch: false,
      views: {
        'data@admin-moderation': {
          controller: 'ModPostsCtrl',
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin/moderation/posts.html')
        }
      },
      resolve: {
        userAccess: modCheck('posts'),
        $title: function() { return 'Post Moderation'; },
        limit: ['$stateParams', function($stateParams) {
          return $stateParams.limit || 15;
        }],
        page: ['$stateParams', function($stateParams) {
          return Number($stateParams.page) || 1;
        }],
        filter: ['$stateParams', function($stateParams) {
          return $stateParams.filter;
        }],
        field: ['$stateParams', function($stateParams) {
          return $stateParams.field;
        }],
        desc: ['$stateParams', function($stateParams) {
          return $stateParams.desc || true;
        }],
        search: ['$stateParams', function($stateParams) {
          return $stateParams.search;
        }],
        reportId: ['$stateParams', function($stateParams) {
          return $stateParams.reportId;
        }],
        reportCount: ['AdminReports', '$stateParams', function(AdminReports, $stateParams) {
          var opts;
          var status = $stateParams.filter;
          var search = $stateParams.search;
          if (status || search) {
            opts = {
              status: status,
              search: search
            };
          }
          return AdminReports.postReportsCount(opts).$promise
          .then(function(postReportsCount) { return postReportsCount.count; });
        }],
        postReports: ['AdminReports', '$stateParams', function(AdminReports, $stateParams) {
          var query = {
            field: $stateParams.field,
            desc: $stateParams.desc || true,
            filter: $stateParams.filter,
            limit: Number($stateParams.limit) || 15,
            page: Number($stateParams.page) || 1,
            search: $stateParams.search
          };
          return AdminReports.pagePostReports(query).$promise
          .then(function(postReports) { return postReports; });
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
          template: fs.readFileSync(__dirname + '/admin/moderation/messages.html')
        }
      },
      resolve: {
        userAccess: modCheck('messages'),
        $title: function() { return 'Messages Moderation'; },
        limit: ['$stateParams', function($stateParams) {
          return $stateParams.limit || 15;
        }],
        page: ['$stateParams', function($stateParams) {
          return Number($stateParams.page) || 1;
        }],
        filter: ['$stateParams', function($stateParams) {
          return $stateParams.filter;
        }],
        field: ['$stateParams', function($stateParams) {
          return $stateParams.field;
        }],
        desc: ['$stateParams', function($stateParams) {
          return $stateParams.desc || true;
        }],
        search: ['$stateParams', function($stateParams) {
          return $stateParams.search;
        }],
        reportId: ['$stateParams', function($stateParams) {
          return $stateParams.reportId;
        }],
        reportCount: ['AdminReports', '$stateParams', function(AdminReports, $stateParams) {
          var opts;
          var status = $stateParams.filter;
          var search = $stateParams.search;
          if (status || search) {
            opts = {
              status: status,
              search: search
            };
          }
          return AdminReports.messageReportsCount(opts).$promise
          .then(function(messageReportsCount) { return messageReportsCount.count; });
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
          return AdminReports.pageMessageReports(query).$promise
          .then(function(messageReports) { return messageReports; });
        }]
      }
    });

    $stateProvider.state('admin-analytics', {
      url: '/admin/analytics',
      parent: 'admin-layout',
      views: {
        'content': {
          controller: 'AnalyticsCtrl',
          controllerAs: 'AnalyticsCtrl',
          template: fs.readFileSync(__dirname + '/admin/analytics/index.html')
        }
      },
      resolve: {
        userAccess: adminCheck('analytics'),
        $title: function() { return 'Analytics'; }
      }
    });

    $stateProvider.state('messages', {
      url: '/messages',
      parent: 'public-layout',
      views: {
        'content': {
          controller: 'MessagesCtrl',
          controllerAs: 'MessagesCtrl',
          template: fs.readFileSync(__dirname + '/messages/messages.html')
        }
      },
      resolve: {
        userAccess: ['$q', 'Session', function($q, Session) {
          if (Session.isAuthenticated) { return true; }
          else { return $q.reject('Unauthorized'); }
        }],
        $title: function() { return 'Private Messages'; },
        pageData: ['Messages', function(Messages) {
          return Messages.latest().$promise
          .then(function(messages) { return messages; });
        }]
      }
    });

    $stateProvider.state('login', {
      parent: 'public-layout',
      views: {
        'content': {
          controller: 'HeaderCtrl',
          controllerAs: 'HeaderCtrl',
          template: fs.readFileSync(__dirname + '/layout/login.html')
        }
      },
      resolve: {
        $title: function() { return 'Login'; }
      }
    });

    $stateProvider.state('404', {
      views: {
        'body': {
          template: fs.readFileSync(__dirname + '/layout/404.html')
        }
      },
      resolve: {
        $title: function() { return '404 Not Found'; }
      }
    });

    // 404 without redirecting user from current url
    $urlRouterProvider.otherwise(function($injector){
       var state = $injector.get('$state');
       state.go('404');
       return true;
    });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('AuthInterceptor');
    $httpProvider.interceptors.push('ViewInterceptor');
    // loading bar latency (For testing only)
    cfpLoadingBarProvider.latencyThreshold = 10;
  }
];
