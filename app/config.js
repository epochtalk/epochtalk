var fs = require('fs');
require('./services');

module.exports = ['$routeProvider', '$locationProvider', '$httpProvider',
  function($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.when('/', {
      controller: 'MainCtrl',
      template: fs.readFileSync(__dirname + '/templates/main.html'),
      label: 'Home'
    });

    $routeProvider.when('/login', {
      controller: 'LoginCtrl',
      template: fs.readFileSync(__dirname + '/templates/login.html'),
      label: 'Login'
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

    $routeProvider.when('/boards/:boardId/threads', {
      controller: 'ThreadsCtrl',
      template: fs.readFileSync(__dirname + '/templates/threads.html'),
      label: 'Threads'
    });

    $routeProvider.when('/threads/:threadId', {
      controller: 'ThreadCtrl',
      template: fs.readFileSync(__dirname + '/templates/thread.html'),
      label: 'Thread'
    });

    $routeProvider.when('/threads/:threadId/posts/:startkey?', {
      controller: 'PostsCtrl',
      template: fs.readFileSync(__dirname + '/templates/posts.html'),
      label: 'Thread'
    });

    $routeProvider.when('/profiles/:userId', {
      controller: 'ProfileCtrl',
      template: fs.readFileSync(__dirname + '/templates/profile.html'),
      label: 'Profile'
    });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('AuthInterceptor');
  }
];