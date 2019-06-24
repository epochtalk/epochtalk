// these should be in the main bundle
// the rest are dynamically loaded wherever needed
angular.module('ept')
  .directive('alert', require('./alert/alert.directive.js'))
  .directive('pagination', require('./pagination/pagination.directive.js'))
  .directive('slideToggle', require('./slide_toggle/slide-toggle.directive.js'))
  .directive('uniqueInvite', require('./unique_invite/unique-invite.directive.js'))
  .directive('modal', require('./modal/modal.directive.js'))
  .directive('autoFocus', require('./autofocus/autofocus.directive.js'))
  .directive('modalFocus', require('./modal_focus/modal-focus.directive.js'))
  .directive('postProcessing', require('./post_processing/post-processing.directive.js'))
  .directive('jumpToPage', require('./jump_to_page/jump-to-page.directive.js'));
