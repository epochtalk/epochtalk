var fs = require('fs');

module.exports = function($routeProvider) {
  $routeProvider.when('/', {
    controller: require('./controllers/main.js'),
    template: fs.readFileSync(__dirname + '/templates/main.html')
  });

  //  ['board', 'thread', 'message'].forEach(function(modelName) {
  //   console.log(modelName);
  //   $routeProvider.when('/' + modelName + 's', {
  //     controller: require('./controllers/' + modelName + 's.js'),
  //     template: fs.readFileSync(__dirname + '/templates/' + modelName + 's.html')
  //   });

  //   $routeProvider.when('/' + modelName + 's/:' + modelName + 'Id', {
  //     controller: require('./controllers/' + modelName + '.js'),
  //     template: fs.readFileSync(__dirname + '/templates/' + modelName + '.html')
  //   });
  // });

  $routeProvider.when('/boards', {
    controller: require('./controllers/boards.js'),
    template: fs.readFileSync(__dirname + '/templates/boards.html')
  });

  $routeProvider.when('/boards/:boardId', {
    controller: require('./controllers/board.js'),
    template: fs.readFileSync(__dirname + '/templates/board.html')
  });

  $routeProvider.when('/threads', {
    controller: require('./controllers/threads.js'),
    template: fs.readFileSync(__dirname + '/templates/threads.html')
  });

  $routeProvider.when('/threads/:threadId', {
    controller: require('./controllers/thread.js'),
    template: fs.readFileSync(__dirname + '/templates/thread.html')
  });

  $routeProvider.when('/messages', {
    controller: require('./controllers/thread.js'),
    template: fs.readFileSync(__dirname + '/templates/thread.html')
  });

  $routeProvider.when('/messages/:messageId', {
    controller: require('./controllers/thread.js'),
    template: fs.readFileSync(__dirname + '/templates/thread.html')
  });
};

