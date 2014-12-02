var fs = require('fs');
require('./filters');
require('./services');
require('./resources');

module.exports = ['$stateProvider', '$locationProvider', '$httpProvider',
  function($stateProvider, $locationProvider, $httpProvider) {

    $stateProvider.state('index', {
      url: '/',
      views: {
        'header': { template: fs.readFileSync(__dirname + '/templates/header.html') },
        'content': {
          controller: 'MainCtrl',
          controllerAs: 'MainCtrl',
          template: fs.readFileSync(__dirname + '/templates/main.html')
        },
        'footer': { template: fs.readFileSync(__dirname + '/templates/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/templates/modals.html') }
      }
    });

    $stateProvider.state('profile', {
      url: '/profiles/{username}',
      views: {
        'header': { template: fs.readFileSync(__dirname + '/templates/header.html') },
        'content': {
          controller: 'ProfileCtrl',
          controllerAs: 'profiles',
          template: fs.readFileSync(__dirname + '/templates/profile.html')
        },
        'footer': { template: fs.readFileSync(__dirname + '/templates/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/templates/modals.html') }
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
        'header': { template: fs.readFileSync(__dirname + '/templates/header.html') },
        'content': {
          controller: 'ConfirmCtrl',
          controllerAs: 'ConfirmCtrl',
          template: fs.readFileSync(__dirname + '/templates/confirm.html')
        },
        'footer': { template: fs.readFileSync(__dirname + '/templates/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/templates/modals.html') }
      }
    });

    $stateProvider.state('reset', {
      url: '/reset/{username}/{token}',
      views: {
        'header': { template: fs.readFileSync(__dirname + '/templates/header.html') },
        'content': {
          controller: 'ResetCtrl',
          controllerAs: 'ResetCtrl',
          template: fs.readFileSync(__dirname + '/templates/reset.html')
        },
        'footer': { template: fs.readFileSync(__dirname + '/templates/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/templates/modals.html') }

      }
    });

    $stateProvider.state('boards', {
      url: '/boards',
      views: {
        'header': { template: fs.readFileSync(__dirname + '/templates/header.html') },
        'content': {
          controller: 'BoardsCtrl',
          controllerAs: 'BoardsCtrl',
          template: fs.readFileSync(__dirname + '/templates/boards.html'),
          resolve: {
            boards: [ 'Boards', function(Boards) {
              return Boards.query();
            }]
          }
        },
        'footer': { template: fs.readFileSync(__dirname + '/templates/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/templates/modals.html') }
      }
    });

    $stateProvider.state('threads', {
      url: '/boards/{boardId}?limit&page',
      // reloadOnSearch: false,
      views: {
        'header': { template: fs.readFileSync(__dirname + '/templates/header.html') },
        'content': {
          controller: 'BoardCtrl',
          controllerAs: 'BoardCtrl',
          template: fs.readFileSync(__dirname + '/templates/board.html'),
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
        },
        'footer': { template: fs.readFileSync(__dirname + '/templates/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/templates/modals.html') }
      }
    });

    $stateProvider.state('newThread', {
      url: '/boards/{boardId}/threads/new',
      views: {
        'header': { template: fs.readFileSync(__dirname + '/templates/header.html') },
        'content': {
          controller: 'NewThreadCtrl',
          controllerAs: 'NewThreadCtrl',
          template: fs.readFileSync(__dirname + '/templates/newThread.html')
        },
        'footer': { template: fs.readFileSync(__dirname + '/templates/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/templates/modals.html') }
      }
    });

    $stateProvider.state('posts', {
      url: '/threads/{threadId}/posts?limit&page',
      // reloadOnSearch: false,
      views: {
        'header': { template: fs.readFileSync(__dirname + '/templates/header.html') },
        'content': {
          controller: 'PostsCtrl',
          controllerAs: 'PostsCtrl',
          template: fs.readFileSync(__dirname + '/templates/posts.html'),
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
        },
        'footer': { template: fs.readFileSync(__dirname + '/templates/footer.html') },
        'modals': { template: fs.readFileSync(__dirname + '/templates/modals.html') }
      }
    });

    $stateProvider.state('admin', {
      url: '/admin',
      protect: true,
      views: {
        'header': { template: fs.readFileSync(__dirname + '/templates/admin/header.html') },
        'modals': { template: fs.readFileSync(__dirname + '/templates/modals.html') },
        'sidenav': { template: fs.readFileSync(__dirname + '/templates/admin/sidenav.html') }
      }
    });

    $stateProvider.state('categories', {
      url: '/admin/categories',
      protect: true,
      views: {
        'header': { template: fs.readFileSync(__dirname + '/templates/admin/header.html') },
        'content': {
          controller: 'CategoriesCtrl',
          template: fs.readFileSync(__dirname + '/templates/admin/categories.html'),
          resolve: {
            categories: ['Boards', function(Boards) {
              return Boards.query();
            }],
            boards: ['Boards', function(Boards) {
              return Boards.all();
            }]
          }
        },
        'modals': { template: fs.readFileSync(__dirname + '/templates/modals.html') },
        'sidenav': { template: fs.readFileSync(__dirname + '/templates/admin/sidenav.html') }
      }
    });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('AuthInterceptor');
    $httpProvider.interceptors.push('ViewInterceptor');
  }
];
