var fs = require('fs');
module.exports = function($routeProvider) {
  $routeProvider.when('/', {
    controller: require('./controllers/main.js'),
    template: fs.readFileSync(__dirname + '/templates/main.html')
  });
};

