var fs = require('fs');
require('./filters');
require('./services');
require('./resources');

module.exports = ['$routeProvider', '$locationProvider', '$httpProvider',
  function($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.when('/', {
      controller: 'MainCtrl',
      template: fs.readFileSync(__dirname + '/templates/main.html')
    });

    $routeProvider.when('/register', {
      controller: 'RegistrationCtrl',
      template: fs.readFileSync(__dirname + '/templates/registration.html')
    });

    $routeProvider.when('/boards', {
      controller: 'BoardsCtrl',
      template: fs.readFileSync(__dirname + '/templates/boards.html')
    });

    $routeProvider.when('/boards/:boardId', {
      controller: 'BoardCtrl',
      template: fs.readFileSync(__dirname + '/templates/board.html')
    });

    $routeProvider.when('/boards/:boardId/threads/new', {
      controller: 'NewThreadCtrl',
      template: fs.readFileSync(__dirname + '/templates/newThread.html')
    });

    $routeProvider.when('/threads/:threadId/posts', {
      controller: 'PostsCtrl',
      template: fs.readFileSync(__dirname + '/templates/posts.html')
    });

    $routeProvider.when('/profiles/:userId', {
      controller: 'ProfileCtrl',
      template: fs.readFileSync(__dirname + '/templates/profile.html')
    });

    $routeProvider.when('/admin/categories', {
      controller: 'CategoriesCtrl',
      template: fs.readFileSync(__dirname + '/templates/admin/categories.html')
    });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('AuthInterceptor');
    $httpProvider.interceptors.push('ViewInterceptor');
  }
];