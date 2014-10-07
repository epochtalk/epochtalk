var fs = require('fs');
require('./services');
require('./resources');

module.exports = ['$routeProvider', '$locationProvider', '$httpProvider',
  function($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.when('/', {
      controller: 'MainCtrl',
      template: fs.readFileSync(__dirname + '/templates/main.html'),
      label: 'Home'
    });

    $routeProvider.when('/register', {
      controller: 'RegistrationCtrl',
      template: fs.readFileSync(__dirname + '/templates/registration.html'),
      label: 'Registration'
    });

    $routeProvider.when('/boards', {
      controller: 'BoardsCtrl',
      template: fs.readFileSync(__dirname + '/templates/boards.html'),
      label: 'All Boards'
    });

    $routeProvider.when('/boards/:boardId', {
      controller: 'BoardCtrl',
      template: fs.readFileSync(__dirname + '/templates/board.html'),
      label: 'Board Name'
    });

    $routeProvider.when('/boards/:boardId/threads/new', {
      controller: 'NewThreadCtrl',
      template: fs.readFileSync(__dirname + '/templates/newThread.html'),
      label: 'New Thread'
    });

    $routeProvider.when('/threads/:threadId/posts', {
      controller: 'PostsCtrl',
      template: fs.readFileSync(__dirname + '/templates/posts.html'),
      label: 'Thread Page'
    });

    $routeProvider.when('/profiles/:userId', {
      controller: 'ProfileCtrl',
      template: fs.readFileSync(__dirname + '/templates/profile.html'),
      label: 'Profile'
    });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('AuthInterceptor');
    $httpProvider.interceptors.push('ViewInterceptor');
  }
];