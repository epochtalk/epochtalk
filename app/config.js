var fs = require('fs');
require('./services');

module.exports = function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    controller: require('./controllers/main.js'),
    template: fs.readFileSync(__dirname + '/templates/main.html')
  });

  $routeProvider.when('/login', {
    controller: require('./controllers/login.js'),
    template: fs.readFileSync(__dirname + '/templates/login.html')
  });

  $routeProvider.when('/register', {
    controller: require('./controllers/register.js'),
    template: fs.readFileSync(__dirname + '/templates/register.html')
  });

  $routeProvider.when('/boards', {
    controller: require('./controllers/boards.js'),
    template: fs.readFileSync(__dirname + '/templates/boards.html')
  });

  $routeProvider.when('/boards/:boardId', {
    controller: require('./controllers/board.js'),
    template: fs.readFileSync(__dirname + '/templates/board.html')
  });

  $routeProvider.when('/boards/:boardId/threads', {
    controller: require('./controllers/threads.js'),
    template: fs.readFileSync(__dirname + '/templates/threads.html')
  });

  $routeProvider.when('/threads/:threadId', {
    controller: require('./controllers/thread.js'),
    template: fs.readFileSync(__dirname + '/templates/thread.html')
  });

  $routeProvider.when('/threads/:threadId/posts/:startkey?', {
    controller: require('./controllers/posts.js'),
    template: fs.readFileSync(__dirname + '/templates/posts.html')
  });

  $locationProvider.html5Mode(true);
};
