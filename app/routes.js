var fs = require('fs');

module.exports = function($routeProvider) {
  $routeProvider.when('/', {
    controller: require('./controllers/main.js'),
    template: fs.readFileSync(__dirname + '/templates/main.html')
  });

  //  ['board', 'topic', 'message'].forEach(function(modelName) {
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

  $routeProvider.when('/boards/:boardId/topics', {
    controller: require('./controllers/topics.js'),
    template: fs.readFileSync(__dirname + '/templates/topics.html')
  });

  $routeProvider.when('/topics/:topicId', {
    controller: require('./controllers/topic.js'),
    template: fs.readFileSync(__dirname + '/templates/topic.html')
  });

  $routeProvider.when('/topics/:topicId/messages', {
    controller: require('./controllers/messages.js'),
    template: fs.readFileSync(__dirname + '/templates/messages.html')
  });

  $routeProvider.when('/messages/:messageId', {
    controller: require('./controllers/topic.js'),
    template: fs.readFileSync(__dirname + '/templates/message.html')
  });
};

