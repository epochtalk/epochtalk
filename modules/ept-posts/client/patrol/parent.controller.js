var ctrl = ['$timeout', '$state', 'Session', 'Posts', 'Reports', 'Alert',
  function($timeout, $state, Session, Posts, Reports, Alert) {
    var ctrl = this;
    this.loggedIn = Session.isAuthenticated;
    this.dirtyEditor = false;
    this.resetEditor = false;
    this.showEditor = false;
    this.focusEditor = false;
    this.quote = '';
    this.posting = { post: { body_html: '', body: '' } };
    this.editorPosition = 'editor-fixed-bottom';
    this.resize = true;

    // Report Permission
    this.reportControlAccess = {
      reportPosts: Session.hasPermission('reports.createPostReport'),
      reportUsers: Session.hasPermission('reports.createUserReport')
    };

    this.canSave = function() {
      var text = ctrl.posting.post.body_html;
      text = text.replace(/(<([^>]+)>)/ig,'');
      text = text.trim();
      return text.length > 0;
    };

    /* Post Methods */

    var discardAlert = function() {
      if (ctrl.dirtyEditor) {
        var message = 'It looks like you were working on something. ';
        message += 'Are you sure you want to leave that behind?';
        return confirm(message);
      }
      else { return true; }
    };

    function closeEditor() {
      ctrl.posting.post.id = '';
      ctrl.posting.post.title = '';
      ctrl.posting.post.body_html = '';
      ctrl.posting.post.body = '';
      ctrl.posting.page = '';
      ctrl.resetEditor = true;
      ctrl.showEditor = false;
    }

    this.loadEditor = function(post) {
      post = post || {};
      if (discardAlert()) {
        var editorPost = ctrl.posting.post;
        editorPost.id = post.id || '';
        editorPost.title = post.thread_title || '';
        editorPost.body_html = post.body_html || '';
        editorPost.thread_id = post.thread_id || '';
        editorPost.body = post.body || '';
        editorPost.page = ctrl.page || 1;
        ctrl.resetEditor = true;
        ctrl.showEditor = true;
        ctrl.focusEditor = true;
      }
    };

    this.savePost = function() {
      var post = ctrl.posting.post;
      Posts.update(post).$promise
      .then(function(data) {
        var filtered = ctrl.posts.filter(function(p) { return p.id === data.id; });
        var editPost = filtered.length > 0 && filtered[0] || {};
        editPost.body_html = data.body_html;
        editPost.body = data.body;
        editPost.updated_at = data.updated_at;
      })
      .then(closeEditor)
      .catch(function(err) {
        var error = 'Post could not be saved';
        if (err.status === 429) { error = 'Post Rate Limit Exceeded'; }
        Alert.error(error);
      });
    };

    this.cancelPost = function() { if (discardAlert()) { closeEditor(); } };

    this.deletePostIndex = -1;
    this.deleteAndLock = true;
    this.showDeleteModal = false;
    this.openDeleteModal = function(index) {
      ctrl.deletePostIndex = index;
      ctrl.showDeleteModal = true;
    };
    this.deletePost = function() {
      ctrl.showDeleteModal = false;
      var locked = ctrl.deleteAndLock;
      var index = ctrl.deletePostIndex;
      var post = ctrl.posts && ctrl.posts[index] || '';
      if (post) {
        Posts.delete({id: post.id, locked: locked}).$promise
        .then(function() { $state.go($state.$current, null, {reload:true}); })
        .catch(function() { Alert.error('Failed to delete post'); });
      }
    };

    this.undeletePostIndex = -1;
    this.showUndeleteModal = false;
    this.openUndeleteModal = function(index) {
      ctrl.undeletePostIndex = index;
      ctrl.showUndeleteModal = true;
    };
    this.undeletePost = function() {
      ctrl.showUndeleteModal = false;
      var index = ctrl.undeletePostIndex;
      var post = ctrl.posts && ctrl.posts[index] || '';
      if (post) {
        Posts.undelete({id: post.id}).$promise
        .then(function() { $state.go($state.$current, null, {reload:true}); })
        .catch(function() { Alert.error('Failed to Undelete Post'); });
      }
    };

    this.purgePostIndex = -1;
    this.showPurgeModal = false;
    this.openPurgeModal = function(index) {
      ctrl.purgePostIndex = index;
      ctrl.showPurgeModal = true;
    };
    this.purgePost = function() {
      ctrl.showPurgeModal = false;
      var index = ctrl.purgePostIndex;
      var post = ctrl.posts && ctrl.posts[index] || '';
      if (post) {
        Posts.purge({id: post.id}).$promise
        .then(function() { $state.go($state.$current, null, {reload:true}); })
        .catch(function() { Alert.error('Failed to purge Post'); });
      }
    };

    this.lockPost = function(post) {
      Posts.lock({id: post.id}).$promise
      .then(function() { post.locked = true; })
      .then(function() { Alert.success('Post Locked'); })
      .catch(function() { Alert.error('Failed to lock post'); });
    };

    this.unlockPost = function(post) {
      Posts.unlock({id: post.id}).$promise
      .then(function() { post.locked = false; })
      .then(function() { Alert.success('Post Unlocked.'); })
      .catch(function() { Alert.error('Failed to Undelete Post'); });
    };


    this.isMinimized = true;
    this.fullscreen = function() {
      if (ctrl.isMinimized) {
        ctrl.isMinimized = false;
        this.editorPosition = 'editor-full-screen';
        this.resize = false;
      }
      else {
        ctrl.isMinimized = true;
        this.editorPosition = 'editor-fixed-bottom';
        this.resize = true;
      }
    };

    /* User/Post Reporting */

    this.reportedPost = {}; // Object being reported
    this.showReportModal = false; // Visible state of modal
    this.offendingId = undefined; // Is the post or user id being reported
    this.reportReason = ''; // The reason for the report
    this.reportSubmitted = false; // Has the report been submitted
    this.reportBtnLabel = 'Submit Report'; // Button label for modal
    this.user = Session.user; // Logged in user
    this.openReportModal = function(post) {
      ctrl.reportedPost = post;
      ctrl.showReportModal = true;
    };

    this.closeReportModal = function() {
      $timeout(function() {
        ctrl.showReportModal = false;
        ctrl.offendingId = undefined;
        ctrl.reportReason = '';
        ctrl.reportedPost = {};
        ctrl.reportSubmitted = false;
        ctrl.reportBtnLabel = 'Submit Report';
      }, 500);
    };

    this.submitReport = function() {
      ctrl.reportSubmitted = true;
      ctrl.reportBtnLabel = 'Submitting...';
      var report = { // build report
        reporter_user_id: ctrl.user.id,
        reporter_reason: ctrl.reportReason
      };
      var reportPromise;
      if (ctrl.offendingId === ctrl.reportedPost.id) { // Post report
        report.offender_post_id = ctrl.offendingId;
        reportPromise = Reports.createPostReport(report).$promise;
      }
      else { // User report
        report.offender_user_id = ctrl.offendingId;
        reportPromise = Reports.createUserReport(report).$promise;
      }
      reportPromise.then(function() {
        ctrl.closeReportModal();
        $timeout(function() { Alert.success('Successfully sent report'); }, 500);
      })
      .catch(function() {
        ctrl.closeReportModal();
        $timeout(function() { Alert.error('Error sending report, please try again later'); }, 500);
      });
    };
  }
];

require('./../../../components/editor/editor.directive');
require('./../../../components/resizeable/resizeable.directive');
require('./../../../components/image_uploader/image_uploader.directive');

module.exports = angular.module('ept.patrol.parentCtrl', [])
.controller('PatrolParentCtrl', ctrl);
