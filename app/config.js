var fs = require('fs');
require('./filters');
require('./services');
require('./resources');

module.exports = ['$stateProvider', '$locationProvider', '$httpProvider',
  function($stateProvider, $locationProvider, $httpProvider) {

    $stateProvider.state('index', {
      url: '/',
      views: {
        'content': {
          controller: ['$state', function($state) { $state.go('boards'); }],
        }
      }
    });

    $stateProvider.state('profile', {
      url: '/profiles/{username}',
      views: {
        'header': { template: fs.readFileSync(__dirname + '/layout/header.html') },
        'content': {
          controller: 'ProfileCtrl',
          controllerAs: 'profiles',
          template: fs.readFileSync(__dirname + '/user/profile.html')
        },
        'footer': { template: fs.readFileSync(__dirname + '/layout/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/layout/modals.html') }
      },
      resolve: {
        user: [ 'User', '$stateParams', function(User, $stateParams) {
          return User.get({ id: $stateParams.username });
        }]
      }
    });

    $stateProvider.state('confirm', {
      url: '/confirm/{username}/{token}',
      views: {
        'header': { template: fs.readFileSync(__dirname + '/layout/header.html') },
        'content': {
          controller: 'ConfirmCtrl',
          controllerAs: 'ConfirmCtrl',
          template: fs.readFileSync(__dirname + '/user/confirm.html')
        },
        'footer': { template: fs.readFileSync(__dirname + '/layout/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/layout/modals.html') }
      }
    });

    $stateProvider.state('reset', {
      url: '/reset/{username}/{token}',
      views: {
        'header': { template: fs.readFileSync(__dirname + '/layout/header.html') },
        'content': {
          controller: 'ResetCtrl',
          controllerAs: 'ResetCtrl',
          template: fs.readFileSync(__dirname + '/user/reset.html')
        },
        'footer': { template: fs.readFileSync(__dirname + '/layout/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/layout/modals.html') }

      }
    });

    $stateProvider.state('boards', {
      url: '/boards',
      views: {
        'header': { template: fs.readFileSync(__dirname + '/layout/header.html') },
        'content': {
          controller: 'BoardsCtrl',
          controllerAs: 'BoardsCtrl',
          template: fs.readFileSync(__dirname + '/boards/boards.html'),
          resolve: {
            boards: [ 'Boards', function(Boards) {
              return Boards.query();
            }]
          }
        },
        'footer': { template: fs.readFileSync(__dirname + '/layout/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/layout/modals.html') }
      }
    });

    $stateProvider.state('board', {
      views: {
        'header': { template: fs.readFileSync(__dirname + '/layout/header.html') },
        'content': {
          controller: [function(){}],
          controllerAs: 'BoardWrapperCtrl',
          template: fs.readFileSync(__dirname + '/board/board.html')
        },
        'footer': { template: fs.readFileSync(__dirname + '/layout/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/layout/modals.html') }
      }
    })
    .state('board.data', {
      url: '/boards/{boardId}?limit&page',
      views: {
        'data@board': {
          controller: 'BoardCtrl',
          controllerAs: 'BoardCtrl',
          template: fs.readFileSync(__dirname + '/board/board.data.html'),
          resolve: {
            board: ['Boards', '$stateParams', function(Boards, $stateParams) {
              return Boards.get({ id: $stateParams.boardId});
            }],
            threads: ['Threads', '$stateParams', function(Threads, $stateParams) {
              var query = {
                board_id: $stateParams.boardId,
                limit: Number($stateParams.limit) || 10,
                page: Number($stateParams.page) || 1
              };
              return Threads.byBoard(query);
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
      views: {
        'header': { template: fs.readFileSync(__dirname + '/layout/header.html') },
        'content': {
          controller: 'NewThreadCtrl',
          controllerAs: 'NewThreadCtrl',
          template: fs.readFileSync(__dirname + '/board/new-thread.html')
        },
        'footer': { template: fs.readFileSync(__dirname + '/layout/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/layout/modals.html') }
      }
    });

    $stateProvider.state('posts', {
      views: {
        'header': { template: fs.readFileSync(__dirname + '/layout/header.html') },
        'content': {
          controller: [function(){}],
          controllerAs: 'PostsWrapperCtrl',
          template: fs.readFileSync(__dirname + '/posts/posts.html')
        },
        'footer': { template: fs.readFileSync(__dirname + '/layout/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/layout/modals.html') }
      }
    })
    .state('posts.data', {
      url: '/threads/{threadId}/posts?limit&page',
      views: {
        'data@posts': {
          controller: 'PostsCtrl',
          controllerAs: 'PostsCtrl',
          template: fs.readFileSync(__dirname + '/posts/posts.data.html'),
          resolve: {
            thread: ['Threads', '$stateParams', function(Threads, $stateParams) {
              return Threads.get({ id: $stateParams.threadId });
            }],
            posts: ['Threads', 'Posts', '$stateParams', function(Threads, Posts, $stateParams) {
              var query = {
                thread_id: $stateParams.threadId,
                page: Number($stateParams.page) || 1
              };
              if ($stateParams.limit === 'all') {
                return Threads.get({ id: $stateParams.threadId }).$promise
                .then(function(thread) {
                  query.limit = Number(thread.post_count) || 10;
                  return Posts.byThread(query);
                });
              }
              else {
                query.limit = Number($stateParams.limit) || 10;
                return Posts.byThread(query);
              }
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

    $stateProvider.state('admin', {
      url: '/admin',
      protect: true,
      views: {
        'header': { template: fs.readFileSync(__dirname + '/layout/header.admin.html') },
        'modals': { template: fs.readFileSync(__dirname + '/layout/modals.html') },
        'sidenav': { template: fs.readFileSync(__dirname + '/layout/sidenav.html') }
      }
    });

    $stateProvider.state('categories', {
      url: '/admin/categories',
      protect: true,
      views: {
        'header': { template: fs.readFileSync(__dirname + '/layout/header.admin.html') },
        'content': {
          controller: 'CategoriesCtrl',
          template: fs.readFileSync(__dirname + '/admin_categories/admin-categories.html'),
          resolve: {
            categories: ['Boards', function(Boards) {
              return Boards.query();
            }],
            boards: ['Boards', function(Boards) {
              return Boards.all();
            }]
          }
        },
        'modals': { template: fs.readFileSync(__dirname + '/layout/modals.html') },
        'sidenav': { template: fs.readFileSync(__dirname + '/layout/sidenav.html') }
      }
    });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('AuthInterceptor');
    $httpProvider.interceptors.push('ViewInterceptor');
  }
];
