// require('foundation/js/vendor/jquery');
// require('foundation/js/vendor/modernizr');
// require('foundation/js/foundation');
// Dependencies
require('angular/angular');
require('angular-cookies/angular-cookies');
require('angular-resource/angular-resource');
require('angular-route/angular-route');
require('angular-sanitize/angular-sanitize');

// Create Angular App
var app = angular.module('ept', [
  'ngRoute',
  'ngCookies',
  'ngResource',
  'ngSanitize'
]);

// Register Controllers
app.controller('HeaderCtrl', require('./controllers/header'));
app.controller('MainCtrl', require('./controllers/main.js'));
app.controller('LoginCtrl', require('./controllers/login.js'));
app.controller('RegisterCtrl', require('./controllers/register.js'));
app.controller('BoardsCtrl', require('./controllers/boards.js'));
app.controller('BoardCtrl', require('./controllers/board.js'));
app.controller('ThreadsCtrl', require('./controllers/threads.js'));
app.controller('ThreadCtrl', require('./controllers/thread.js'));
app.controller('PostsCtrl', require('./controllers/posts.js'));

// Set Angular Configs
app.config(require('./config'));

// CSS Styles
require('./css/normalize.css');
require('./css/foundation.css');
require('./css/style.css');
