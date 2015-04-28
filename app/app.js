// Dependencies
require('angular/angular');
require('angular-resource/angular-resource');
require('angular-sanitize/angular-sanitize');
require('angular-animate/angular-animate');
require('angular-ui-router');
require('angular-loading-bar');
jQuery = require('foundation/js/vendor/jquery');
$ = jQuery;
require('nestable/jquery.nestable');
require('foundation/js/vendor/fastclick');
require('foundation/js/vendor/placeholder');
require('foundation/js/foundation');

// Create Angular App
var app = angular.module('ept', [
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ui.router',
  'angular-loading-bar'
]);

// Register Forum Page Controllers
app.controller('BoardsCtrl',        require('./boards/boards.controller.js'));
app.controller('BoardCtrl',         require('./board/board.controller.js'));
app.controller('NewThreadCtrl',     require('./board/new-thread.controller.js'));
app.controller('PostsParentCtrl',   require('./posts/parent.controller.js'));
app.controller('PostsCtrl',         require('./posts/posts.controller.js'));
app.controller('HeaderCtrl',        require('./layout/header.controller.js'));
app.controller('ProfileCtrl',       require('./user/profile.controller.js'));
app.controller('ResetCtrl',         require('./user/reset.controller.js'));
app.controller('ConfirmCtrl',       require('./user/confirm.controller.js'));

// Register Admin Page Controllers
app.controller('GeneralSettingsCtrl', require('./admin/settings/general.controller.js'));
app.controller('ForumSettingsCtrl',   require('./admin/settings/forum.controller.js'));
app.controller('CategoriesCtrl',      require('./admin/management/boards.controller.js'));
app.controller('UsersCtrl',           require('./admin/management/users.controller.js'));
app.controller('ModeratorsCtrl',      require('./admin/management/moderators.controller.js'));
app.controller('AdministratorsCtrl',  require('./admin/management/administrators.controller.js'));
app.controller('ModUsersCtrl',        require('./admin/moderation/users.controller.js'));
app.controller('ModPostsCtrl',        require('./admin/moderation/posts.controller.js'));
app.controller('AnalyticsCtrl',       require('./admin/analytics/analytics.controller.js'));

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
app.directive('scrollLock',         require('./components/scroll_lock/scroll-lock.directive.js'));
app.directive('resizeable',         require('./components/resizeable/resizeable.directive.js'));
app.directive('imageLoader',        require('./components/image_loader/image_loader.directive.js'));
app.directive('postProcessing',     require('./components/post-processing/post-processing.directive.js'));
app.directive('imageUploader',      require('./components/image_uploader/image_uploader.directive.js'));
app.directive('alert',              require('./components/alert/alert.directive.js'));
app.directive('disableAnimation',   require('./components/disable_animation/disable-animation.directive.js'));

// Set Angular Configs
app.config(require('./config'))
.run(['$rootScope', '$state', '$timeout', 'Auth', 'BreadcrumbSvc', function($rootScope, $state, $timeout, Auth, BreadcrumbSvc) {

  // Load foundation on view change
  $rootScope.$on('$viewContentLoaded', function() {
    $timeout(function() { $(document).foundation(); });
  });

  // Dynamically populate breadcrumbs
  $rootScope.$on('$stateChangeSuccess', function() {
    BreadcrumbSvc.update();
  });

  // 404 if there is an error changing state
  $rootScope.$on('$stateChangeError', function(event, next, nextParams, prev, prevParams, error) {
    event.preventDefault();
    // Check if state change error was caused by unauthorized access to a route
    if (error === 'Unauthorized') { $state.go('boards'); }
    else { $state.go('404'); }
  });
}]);
