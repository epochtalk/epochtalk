var fs = require('fs');
require('./services');

module.exports = ['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
      controller: 'MainCtrl',
      template: fs.readFileSync(__dirname + '/templates/main.html')
    });

    $routeProvider.when('/login', {
      controller: 'LoginCtrl',
      template: fs.readFileSync(__dirname + '/templates/login.html')
    });

    $routeProvider.when('/register', {
      controller: 'RegisterCtrl',
      template: fs.readFileSync(__dirname + '/templates/register.html')
    });

    $routeProvider.when('/boards', {
      controller: 'BoardsCtrl',
      template: fs.readFileSync(__dirname + '/templates/boards.html')
    });

    $routeProvider.when('/boards/:boardId', {
      controller: 'BoardCtrl',
      template: fs.readFileSync(__dirname + '/templates/board.html')
    });

    $routeProvider.when('/boards/:boardId/threads', {
      controller: 'ThreadsCtrl',
      template: fs.readFileSync(__dirname + '/templates/threads.html')
    });

    $routeProvider.when('/threads/:parentPostId', {
      controller: 'ThreadCtrl',
      template: fs.readFileSync(__dirname + '/templates/thread.html')
    });

    $routeProvider.when('/threads/:parentPostId/posts/:startkey?', {
      controller: 'PostsCtrl',
      template: fs.readFileSync(__dirname + '/templates/posts.html')
    });

    $locationProvider.html5Mode(true);
  }
];