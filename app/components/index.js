var app = angular.module('ept');
app.directive('modal', require('./modal/modal.directive.js'));
app.directive('slideToggle', require('./slide_toggle/slide-toggle.directive.js'));
app.directive('autoFocus', require('./autofocus/autofocus.directive.js'));
app.directive('uniqueUsername', require('./unique_username/unique-username.directive.js'));
app.directive('uniqueEmail', require('./unique_email/unique-email.directive.js'));
app.directive('scrollLock', require('./scroll_lock/scroll-lock.directive.js'));
app.directive('pagination', require('./pagination/pagination.directive.js'));
app.directive('resizeable', require('./resizeable/resizeable.directive.js'));
app.directive('imageLoader', require('./image_loader/image_loader.directive.js'));
app.directive('postProcessing', require('./post-processing/post-processing.directive.js'));
app.directive('alert', require('./alert/alert.directive.js'));
app.directive('imageUploader', require('./image_uploader/image_uploader.directive.js'));

app.directive('categoryEditor', require('./category_editor/category-editor.directive.js'));
app.directive('nestableBoards', require('./category_editor/nestable-boards.directive.js'));
app.directive('nestableCategories', require('./category_editor/nestable-categories.directive.js'));

app.directive('autocompleteUsername', require('./autocomplete_username/autocomplete-username.directive.js'));
app.directive('autocompleteUserId', require('./autocomplete_user_id/autocomplete-user-id.directive.js'));
app.directive('epochtalkEditor', require('./editor/editor.directive.js'));
