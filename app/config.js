var fs = require('fs');
require('./filters');
require('./services');
require('./resources');

module.exports = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
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
      views: {
        'content': {
          controller: 'ProfileCtrl',
          controllerAs: 'profiles',
          template: fs.readFileSync(__dirname + '/user/profile.html')
        }
      },
      resolve: {
        user: [ 'User', '$stateParams', function(User, $stateParams) {
          return User.get({ id: $stateParams.username }).$promise
          .then(function(user) { return user; });
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
      }
    });

    $stateProvider.state('boards', {
      url: '/',
      parent: 'public-layout',
      views: {
        'content': {
          controller: 'BoardsCtrl',
          controllerAs: 'BoardsCtrl',
          template: fs.readFileSync(__dirname + '/boards/boards.html'),
          resolve: {
            boards: [ 'Boards', function(Boards) {
              return Boards.query().$promise
              .then(function(categorizedBoards) { return categorizedBoards; });
            }]
          }
        }
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
        },
      }
    })
    .state('board.data', {
      url: '/boards/{boardId}?limit&page',
      reloadOnSearch: false,
      views: {
        'data@board': {
          controller: 'BoardCtrl',
          controllerAs: 'BoardCtrl',
          template: fs.readFileSync(__dirname + '/board/board.data.html'),
          resolve: {
            board: ['Boards', '$stateParams', function(Boards, $stateParams) {
              return Boards.get({ id: $stateParams.boardId }).$promise
              .then(function(board) { return board; });
            }],
            threads: ['Threads', '$stateParams', function(Threads, $stateParams) {
              var query = {
                board_id: $stateParams.boardId,
                limit: Number($stateParams.limit) || 10,
                page: Number($stateParams.page) || 1
              };
              return Threads.byBoard(query).$promise
              .then(function(threads) { return threads; });
            }],
            page: ['$stateParams', function($stateParams) {
              return Number($stateParams.page) || 1;
            }],
            threadLimit: ['$stateParams', function($stateParams) {
              // TODO: this needs to be grabbed from user settings
              return Number($stateParams.limit) || 10;
            }],
            postLimit: [function() {
              // TODO: this needs to be grabbed from user settings
              return 10;
            }]
          }
        }
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
      url: '/threads/{threadId}/posts?limit&page',
      reloadOnSearch: false,
      views: {
        'data@posts': {
          controller: 'PostsCtrl',
          controllerAs: 'PostsCtrl',
          template: fs.readFileSync(__dirname + '/posts/posts.data.html'),
          resolve: {
            thread: ['Threads', '$stateParams', function(Threads, $stateParams) {
              return Threads.get({ id: $stateParams.threadId }).$promise
              .then(function(thread) { return thread; });
            }],
            posts: ['Posts', '$stateParams', function(Posts, $stateParams) {
              var limit = $stateParams.limit;
              var query = {
                thread_id: $stateParams.threadId,
                page: Number($stateParams.page) || 1,
                limit: limit === 'all' ? limit : (Number(limit) || 10)
              };
              return Posts.byThread(query).$promise
              .then(function(posts) { return posts; });
            }],
            page: ['$stateParams', function($stateParams) {
              return Number($stateParams.page) || 1;
            }],
            limit: ['$stateParams', function($stateParams) {
              // TODO: this needs to be grabbed from user settings
              if ($stateParams.limit === 'all') { return 'all'; }
              else { return Number($stateParams.limit) || 10; }
            }]
          }
        }
      }
    });

    // Checks if user is an admin
    var adminCheck = ['$q', 'Session', function($q, Session) {
      if (Session.user.isAdmin) { return true; }
      else { return $q.reject('Unauthorized'); }
    }];

    // Checks if user is a moderator
    var modCheck = ['$q', 'Session', function($q, Session) {
      if (Session.user.isMod) { return true; }
      else { return $q.reject('Unauthorized'); }
    }];

    // Default child state for moderate is users
    $urlRouterProvider.when('/moderation', '/moderation/users');

    $stateProvider.state('moderation', {
      url: '/moderation',
      parent: 'public-layout',
      views: {
        'content': {
          controller: [function() { this.fullWidth = false; }],
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin/moderation/index.html'),
          resolve: { modCheck: modCheck }
        }
      }
    })
    .state('moderation.users', {
      url: '/users',
      views: {
        'data@moderation': {
          controller: 'ModUsersCtrl',
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin/moderation/users.html'),
        }
      }
    })
    .state('moderation.posts', {
      url: '/posts',
      views: {
        'data@moderation': {
          controller: 'ModPostsCtrl',
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin/moderation/posts.html'),
        }
      }
    });

    $urlRouterProvider.when('/admin', '/admin/settings/general');
    $urlRouterProvider.when('/admin/', '/admin/settings/general');

    $stateProvider.state('admin', {
      url: '/admin',
      parent: 'admin-layout',
      resolve: { adminCheck: adminCheck }
    });

    // Default child state for admin-settings is general
    $urlRouterProvider.when('/admin/settings', '/admin/settings/general');
    $urlRouterProvider.when('/admin/settings/', '/admin/settings/general');

    $stateProvider.state('admin-settings', {
      url: '/admin/settings',
      parent: 'admin-layout',
      views: {
        'content': {
          template: fs.readFileSync(__dirname + '/admin/settings/index.html'),
          resolve: { adminCheck: adminCheck }
        }
      }
    })
    .state('admin-settings.general', {
      url: '/general',
      views: {
        'data@admin-settings': {
          controller: 'GeneralSettingsCtrl',
          controllerAs: 'AdminSettingsCtrl',
          template: fs.readFileSync(__dirname + '/admin/settings/general.html'),
        }
      }
    })
    .state('admin-settings.forum', {
      url: '/forum',
      views: {
        'data@admin-settings': {
          controller: 'ForumSettingsCtrl',
          controllerAs: 'AdminSettingsCtrl',
          template: fs.readFileSync(__dirname + '/admin/settings/forum.html'),
        }
      }
    });

    // Default child state for admin-management is users
    $urlRouterProvider.when('/admin/management', '/admin/management/boards');
    $urlRouterProvider.when('/admin/management/', '/admin/management/boards');

    $stateProvider.state('admin-management', {
      url: '/admin/management',
      parent: 'admin-layout',
      views: {
        'content': {
          template: fs.readFileSync(__dirname + '/admin/management/index.html'),
          resolve: { adminCheck: adminCheck }
        }
      }
    })
    .state('admin-management.boards', {
      url: '/boards',
      views: {
        'data@admin-management': {
          controller: 'CategoriesCtrl',
          controllerAs: 'AdminManagementCtrl',
          template: fs.readFileSync(__dirname + '/admin/management/boards.html'),
          resolve: {
            adminCheck: adminCheck,
            categories: ['Boards', function(Boards) {
              return Boards.query().$promise
              .then(function(categories) { return categories; });
            }],
            boards: ['Boards', function(Boards) {
              return Boards.all().$promise
              .then(function(boards) {return boards; });
            }]
          }
        }
      }
    })
    .state('admin-management.users', {
      url: '/users',
      views: {
        'data@admin-management': {
          controller: 'UsersCtrl',
          controllerAs: 'UsersCtrl',
          template: fs.readFileSync(__dirname + '/admin/management/users.html'),
          resolve: {
            adminCheck: adminCheck,
            users: ['User', function(User) {
              return User.all().$promise
              .then(function(users) { return users; });
            }]
          }
        }
      }
    })
    .state('admin-management.moderators', {
      url: '/moderators',
      views: {
        'data@admin-management': {
          controller: 'ModeratorsCtrl',
          controllerAs: 'AdminManagementCtrl',
          template: fs.readFileSync(__dirname + '/admin/management/moderators.html'),
        }
      }
    })
    .state('admin-management.administrators', {
      url: '/administrators',
      views: {
        'data@admin-management': {
          controller: 'AdministratorsCtrl',
          controllerAs: 'AdminManagementCtrl',
          template: fs.readFileSync(__dirname + '/admin/management/administrators.html'),
        }
      }
    });

    // Default child state for admin-moderation is users
    $urlRouterProvider.when('/admin/moderation', '/admin/moderation/users');
    $urlRouterProvider.when('/admin/moderation/', '/admin/moderation/users');

    $stateProvider.state('admin-moderation', {
      url: '/admin/moderation',
      parent: 'admin-layout',
      views: {
        'content': {
          controller: [function() { this.fullWidth = true; }],
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin/moderation/index.html'),
          resolve: { adminCheck: adminCheck }
        }
      }
    })
    .state('admin-moderation.users', {
      url: '/users',
      views: {
        'data@admin-moderation': {
          controller: 'ModUsersCtrl',
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin/moderation/users.html'),
        }
      }
    })
    .state('admin-moderation.posts', {
      url: '/posts',
      views: {
        'data@admin-moderation': {
          controller: 'ModPostsCtrl',
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin/moderation/posts.html')
        }
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
      }
    });

    $stateProvider.state('404', {
      views: {
        'body': {
          template: fs.readFileSync(__dirname + '/layout/404.html')
        }
      },
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
  }
];
