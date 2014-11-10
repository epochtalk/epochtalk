var fs = require('fs');
require('./filters');
require('./services');
require('./resources');

module.exports = ['$routeProvider', '$locationProvider', '$httpProvider',
  function($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.when('/', {
      controller: 'MainCtrl',
      controllerAs: 'MainCtrl',
      template: fs.readFileSync(__dirname + '/templates/main.html')
    });

    $routeProvider.when('/register', {
      controller: 'RegistrationCtrl',
      controllerAs: 'RegistrationCtrl',
      template: fs.readFileSync(__dirname + '/templates/registration.html')
    });

    $routeProvider.when('/reset/:username/:token', {
      controller: 'ResetCtrl',
      controllerAs: 'ResetCtrl',
      template: fs.readFileSync(__dirname + '/templates/reset.html'),
      resolve: {
        tokenStatus: [ 'User', '$route', function(Users, $route) {
          var params = {
            username: $route.current.params.username,
            token: $route.current.params.token
          };
          return Users.isValidResetToken(params);
        }]
      }
    });

    $routeProvider.when('/boards', {
      controller: 'BoardsCtrl',
      controllerAs: 'BoardsCtrl',
      template: fs.readFileSync(__dirname + '/templates/boards.html'),
      resolve: {
        boards: [ 'Boards', function(Boards) {
          return Boards.query();
        }]
      }
    });

    $routeProvider.when('/boards/:boardId', {
      controller: 'BoardCtrl',
      controllerAs: 'BoardCtrl',
      reloadOnSearch: false,
      template: fs.readFileSync(__dirname + '/templates/board.html'),
      resolve: {
        board: ['Boards', '$route', function(Boards, $route) {
          return Boards.get({ id: $route.current.params.boardId});
        }],
        threads: ['Threads', '$route', function(Threads, $route) {
          var query = {
            board_id: $route.current.params.boardId,
            limit: Number($route.current.params.limit) || 10,
            page: Number($route.current.params.page) || 1
          };
          return Threads.byBoard(query);
        }],
        page: ['$route', function($route) {
          return Number($route.current.params.page) || 1;
        }],
        threadLimit: ['$route', function($route) {
          // TODO: this needs to be grabbed from user settings
          return Number($route.current.params.limit) || 10;
        }],
        postLimit: [function() {
          // TODO: this needs to be grabbed from user settings
          return 10;
        }]
      }
    });

    $routeProvider.when('/boards/:boardId/threads/new', {
      controller: 'NewThreadCtrl',
      controllerAs: 'NewThreadCtrl',
      template: fs.readFileSync(__dirname + '/templates/newThread.html')
    });

    $routeProvider.when('/threads/:threadId/posts', {
      controller: 'PostsCtrl',
      controllerAs: 'PostsCtrl',
      template: fs.readFileSync(__dirname + '/templates/posts.html'),
      reloadOnSearch: false,
      resolve: {
        thread: ['Threads', '$route', function(Threads, $route) {
          return Threads.get({ id: $route.current.params.threadId });
        }],
        posts: ['Posts', '$route', function(Posts, $route) {
          var query = {
            thread_id: $route.current.params.threadId,
            limit: Number($route.current.params.limit) || 10,
            page: Number($route.current.params.page) || 1
          };
          return Posts.byThread(query);
        }],
        page: ['$route', function($route) {
          return Number($route.current.params.page) || 1;
        }],
        limit: ['$route', function($route) {
          // TODO: this needs to be grabbed from user settings
          if ($route.current.params.limit === 'all') { return 'all'; }
          else { return Number($route.current.params.limit) || 10; }
        }]
      }
    });

    $routeProvider.when('/profiles/:username', {
      controller: 'ProfileCtrl',
      controllerAs: 'profiles',
      template: fs.readFileSync(__dirname + '/templates/profile.html'),
      resolve: {
        user: [ 'User', '$route', function(Users, $route) {
          return Users.get({ id: $route.current.params.username });
        }]
      }
    });

    $routeProvider.when('/admin/categories', {
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
    });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('AuthInterceptor');
    $httpProvider.interceptors.push('ViewInterceptor');
  }
];