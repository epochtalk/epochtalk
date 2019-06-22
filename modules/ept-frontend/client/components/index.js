var app = angular.module('ept');
// these should be in the main bundle
app.directive('alert', require('./alert/alert.directive.js'));
app.directive('pagination', require('./pagination/pagination.directive.js'));
app.directive('slideToggle', require('./slide_toggle/slide-toggle.directive.js'));
app.directive('uniqueUsername', require('./unique_username/unique-username.directive.js'));
app.directive('uniqueInvite', require('./unique_invite/unique-invite.directive.js'));
app.directive('uniqueEmail', require('./unique_email/unique-email.directive.js'));
app.directive('modal', require('./modal/modal.directive.js'));
app.directive('autoFocus', require('./autofocus/autofocus.directive.js'));
app.directive('modalFocus', require('./modal_focus/modal-focus.directive.js'));
app.directive('postProcessing', require('./post_processing/post-processing.directive.js'));
app.directive('jumpToPage', require('./jump_to_page/jump-to-page.directive.js'));
