// Dependencies
require('angular/angular');
require('angular-resource/angular-resource');
require('angular-route/angular-route');
require('angular-sanitize/angular-sanitize');
require('angular-ui-router');
// var Modernizr = require('foundation/js/vendor/modernizr');
jQuery = require('foundation/js/vendor/jquery');
$ = jQuery;
require('nestable/jquery.nestable');
require('foundation/js/vendor/fastclick');
require('foundation/js/vendor/placeholder');
require('foundation/js/foundation');

// Create Angular App
var app = angular.module('ept', [
  'ngRoute',
  'ngResource',
  'ngSanitize',
  'ui.router'
]);

// Register Forum Page Controllers
app.controller('BoardsCtrl',        require('./boards/boards.controller.js'));
app.controller('BoardCtrl',         require('./board/board.controller.js'));
app.controller('NewThreadCtrl',     require('./board/new-thread.controller.js'));
app.controller('PostsCtrl',         require('./posts/posts.controller.js'));
app.controller('LayoutCtrl',        require('./layout/layout.controller.js'));
app.controller('HeaderCtrl',        require('./layout/header.controller.js'));
app.controller('ProfileCtrl',       require('./user/profile.controller.js'));
app.controller('ResetCtrl',         require('./user/reset.controller.js'));
app.controller('ConfirmCtrl',       require('./user/confirm.controller.js'));

// Register Admin Page Controllers
app.controller('AdminNavCtrl',      require('./layout/sidenav.controller.js'));
app.controller('CategoriesCtrl',    require('./admin_categories/admin-categories.controller.js'));
app.controller('UsersCtrl',         require('./admin_users/admin-users.controller.js'));
app.controller('ModeratorsCtrl',    require('./admin_moderators/admin-moderators.controller.js'));
app.controller('ModerationCtrl',    require('./admin_moderation/admin-moderation.controller.js'));

// Register Directives
app.directive('pagination',         require('./components/pagination/pagination.directive.js'));
app.directive('epochtalkEditor',    require('./components/editor/editor.directive.js'));
app.directive('categoryEditor',     require('./components/category_editor/category-editor.directive.js'));
app.directive('nestableBoards',     require('./components/category_editor/nestable-boards.directive.js'));
app.directive('nestableCategories', require('./components/category_editor/nestable-categories.directive.js'));
app.directive('modal',              require('./components/modal/modal.directive.js'));
app.directive('slideToggle',        require('./components/slide_toggle/slide-toggle.directive.js'));
app.directive('autoFocus',          require('./components/autofocus/autofocus.directive.js'));
app.directive('uniqueUsername',     require('./components/unique_username/unique-username.directive.js'));
app.directive('uniqueEmail',        require('./components/unique_email/unique-email.directive.js'));

// Set Angular Configs
app.config(require('./config'))
.run(['$rootScope', '$state', '$timeout', 'Auth', 'BreadcrumbSvc', function($rootScope, $state, $timeout, Auth, BreadcrumbSvc) {

  // Load foundation on view change
  $rootScope.$on('$viewContentLoaded', function() {
    $timeout(function() { $(document).foundation(); });
  });

  // Redirect users from protected routes
  // TODO: Add check to see if user is admin
  $rootScope.$on('$stateChangeStart', function (event, next) {
    if (next && next.protect) {
      var isAuthenticated = Auth.isAuthenticated();
      // Possibly redirect to login page in the future
      if (!isAuthenticated) { $timeout(function() { $state.go('boards'); }); }
    }
  });

  // Dynamically populate breadcrumbs
  $rootScope.$on('$stateChangeSuccess', function() {
    BreadcrumbSvc.update();
  });

}]);


// CSS Styles
var cssify = require('cssify');
require('./css/app.css');
cssify.byUrl('//netdna.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.css');
