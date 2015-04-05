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
        'body': { template: fs.readFileSync(__dirname + '/layout/admin-content.html') },
        'sidenav': {
          controller: 'AdminNavCtrl',
          controllerAs: 'AdminNavCtrl',
          template: fs.readFileSync(__dirname + '/layout/sidenav.html')
        }
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
    var adminCheck = ['$q', 'Auth', function($q, Auth) {
      return Auth.checkAdmin()
      .then(function(isAdmin) {
        if (isAdmin) { return true; }
        // $stateChangeError in app.js expects error to be 'Unauthorized'
        else { return $q.reject('Unauthorized'); }
      });
    }];

    // Checks if user is a moderator
    var modCheck = ['$q', 'Auth', function($q, Auth) {
      return Auth.checkModerator()
      .then(function(isMod) {
        if (isMod) { return true; }
        // $stateChangeError in app.js expects error to be 'Unauthorized'
        else { return $q.reject('Unauthorized'); }
      });
    }];

    // Default child state for moderate is users
    $urlRouterProvider.when('/moderate', '/moderate/users');

    $stateProvider.state('moderate', {
      url: '/moderate',
      parent: 'public-layout',
      views: {
        'content': {
          controller: [function() { this.fullWidth = false; }],
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin_moderation/moderate.html'),
          resolve: { modCheck: modCheck }
        }
      }
    })
    .state('moderate.users', {
      url: '/users',
      views: {
        'data@moderate': {
          controller: 'ModUsersCtrl',
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin_moderation/users.html'),
        }
      }
    })
    .state('moderate.threads', {
      url: '/threads',
      views: {
        'data@moderate': {
          controller: 'ModThreadsCtrl',
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin_moderation/threads.html'),
        }
      }
    })
    .state('moderate.posts', {
      url: '/posts',
      views: {
        'data@moderate': {
          controller: 'ModPostsCtrl',
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin_moderation/posts.html'),
        }
      }
    });

    $stateProvider.state('admin', {
      url: '/admin',
      parent: 'admin-layout',
      resolve: { adminCheck: adminCheck }
    });

    // Default child state for admin-moderation is users
    $urlRouterProvider.when('/admin/moderate', '/admin/moderate/users');

    $stateProvider.state('admin-moderate', {
      url: '/admin/moderate',
      parent: 'admin-layout',
      views: {
        'content': {
          controller: [function() { this.fullWidth = true; }],
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin_moderation/moderate.html'),
          resolve: { adminCheck: adminCheck }
        }
      }
    })
    .state('admin-moderate.users', {
      url: '/users',
      views: {
        'data@admin-moderate': {
          controller: 'ModUsersCtrl',
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin_moderation/users.html'),
        }
      }
    })
    .state('admin-moderate.threads', {
      url: '/threads',
      views: {
        'data@admin-moderate': {
          controller: 'ModThreadsCtrl',
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin_moderation/threads.html'),
        }
      }
    })
    .state('admin-moderate.posts', {
      url: '/posts',
      views: {
        'data@admin-moderate': {
          controller: 'ModPostsCtrl',
          controllerAs: 'ModerationCtrl',
          template: fs.readFileSync(__dirname + '/admin_moderation/posts.html')
        }
      }
    });

    $stateProvider.state('admin-categories', {
      url: '/admin/categories',
      parent: 'admin-layout',
      views: {
        'content': {
          controller: 'CategoriesCtrl',
          template: fs.readFileSync(__dirname + '/admin_categories/categories.html'),
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
    });

    $stateProvider.state('admin-users', {
      url: '/admin/users',
      parent: 'admin-layout',
      views: {
        'content': {
          controller: 'UsersCtrl',
          controllerAs: 'UsersCtrl',
          template: fs.readFileSync(__dirname + '/admin_users/users.html'),
          resolve: {
            adminCheck: adminCheck,
            users: ['User', function(User) {
              return User.all().$promise
              .then(function(users) { return users; });
            }]
          }
        }
      }
    });

    $stateProvider.state('admin-groups', {
      url: '/admin/groups',
      parent: 'admin-layout',
      views: {
        'content': {
          controller: 'GroupsCtrl',
          controllerAs: 'GroupsCtrl',
          template: fs.readFileSync(__dirname + '/admin_groups/groups.html')
        }
      },
      resolve: {
        adminCheck: adminCheck,
        users: ['User', function(User) {
          return User.all().$promise
          .then(function(users) { return users; });
        }]
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
