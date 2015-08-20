var _ = require('lodash');

module.exports = [
  '$scope', '$timeout', '$location', '$state', 'Session', 'Boards', 'Posts', 'Threads', 'Reports', 'Alert',
  function($scope, $timeout, $location, $state, Session, Boards, Posts, Threads, Reports, Alert) {
    var ctrl = this;
    this.loggedIn = Session.isAuthenticated;
    this.dirtyEditor = false;
    this.resetEditor = false;
    this.showEditor = false;
    this.focusEditor = false;
    this.newPostEnabled = false;
    this.quote = '';
    this.tempPost = { body: '', raw_body: '' };
    this.posting = { post: this.tempPost };
    this.editorPosition = 'editor-fixed-bottom';
    this.resize = true;
    this.moveBoard = {};
    this.boards = [];
    this.showThreadControls = function() {
      var show = false;
      if (ctrl.user.isAdmin || ctrl.user.isMod) { show = true; }
      else if (ctrl.user.id === ctrl.thread.user.id) { show = true; }
      return show;
    };
    this.allowPosting = function() {
      return ctrl.loggedIn() && ctrl.newPostEnabled && !ctrl.thread.locked;
    };
    getBoards();
    function getBoards() {
      // check if user is an admin
      var adminRole = _.find(Session.user.roles, function(role) {
        return role.name === 'Administrator';
      });

      if (adminRole) {
        return Boards.all().$promise
        .then(function(allBoards) {
          ctrl.boards = allBoards || [];
          ctrl.moveBoard = _.find(ctrl.boards, function(board) {
            return board.id === ctrl.board_id;
          });
        });
      }
      else { ctrl.boards = []; }
    }

    function calculatePages() {
      var count;
      if (ctrl.limit === 'all') { count = Number(ctrl.thread.post_count); }
      else { count = Number(ctrl.limit) || 25; }
      ctrl.pageCount = Math.ceil(ctrl.thread.post_count / count);
    }
    // pullPage function injected by child controller

    $scope.$watch(
      function() { return ctrl.thread.post_count; },
      function(postCount) { if (postCount) { calculatePages(); } }
    );

    $scope.$watchGroup(
      [function() { return ctrl.thread.id; },
       function() { return ctrl.thread.title; }],
      function(values) {
        var id = values[0];
        var title = values[1];
        if (id && title && ctrl.newPostEnabled === false) {
          initEditor(); //set editor
          ctrl.newPostEnabled = true;
        }
      }
    );

    /* Thread Methods */

    this.updateThreadLock = function() {
      // let angular digest the change in lock status
      $timeout(function() {
        var lockStatus = ctrl.thread.locked;
        return Threads.lock({id: ctrl.thread.id}, {status: lockStatus}).$promise
        .then(function(lockThread) { ctrl.thread.locked = lockThread.locked; });
      });
    };

    this.updateThreadSticky = function() {
      // let angular digest the change in lock status
      $timeout(function() {
        var stickyStatus = ctrl.thread.sticky;
        return Threads.sticky({id: ctrl.thread.id}, {status: stickyStatus}).$promise
        .then(function(stickyThread) { ctrl.thread.sticky = stickyThread.sticky; });
      });
    };

    this.moveThread = function() {
      var newBoardId = ctrl.moveBoard.id;
      return Threads.move({id: ctrl.thread.id}, {newBoardId: newBoardId}).$promise
      .then(function(newBoard) { $state.go($state.$current, null, {reload:true}); });
    };

    this.showPurgeThreadModal = false;
    this.closePurgeThreadModal = function() {
      $timeout(function() { ctrl.showPurgeThreadModal = false; });
    };
    this.openPurgeThreadModal = function() {
      ctrl.showPurgeThreadModal = true;
    };
    this.purgeThread = function() {
      Threads.delete({id: ctrl.thread.id}).$promise
      .then(function() { $state.go('board.data', {boardId: ctrl.board_id}); })
      .catch(function(err) { Alert.error('Failed to purge Thread'); })
      .finally(function() { ctrl.showPurgeThreadModal = false; });
    };

    /* Post Methods */

    var discardAlert = function() {
      if (ctrl.dirtyEditor) {
        var message = 'It looks like you were working on something. ';
        message += 'Are you sure you want to leave that behind?';
        return confirm(message);
      }
      else { return true;}
    };

    var initEditor = function(index, show) {
      var post = ctrl.posts && ctrl.posts[index] || '';
      if (post) {
        ctrl.posting.type = 'edit';
        ctrl.posting.index = index;
      }
      else {
        ctrl.posting.type = 'new';
        ctrl.posting.index = '';
      }

      ctrl.posting.id = post.id || '';
      var editorPost = ctrl.posting.post;
      editorPost.thread_id = post.thread_id || ctrl.thread.id;
      editorPost.title = post.title || 'Re: ' + ctrl.thread.title;
      editorPost.body = post.body || '';
      editorPost.raw_body = post.raw_body || '';

      ctrl.resetEditor = true;
    };

    this.openEditor = function() {
      ctrl.showEditor = true;
      ctrl.focusEditor = true;
    };

    this.closeEditor = function() { ctrl.showEditor = false; };

    this.addQuote = function(index) {
      var timeDuration = 0;
      if (ctrl.showEditor === false) {
        ctrl.showEditor = true;
        timeDuration = 100;
      }

      $timeout(function() {
        var post = ctrl.posts && ctrl.posts[index] || '';
        if (post) {
          ctrl.quote = {
            username: post.user.username,
            threadId: ctrl.thread.id,
            page: ctrl.page,
            postId: post.id,
            createdAt: new Date(post.created_at).getTime(),
            body: post.raw_body || post.body
          };
        }
      }, timeDuration);
    };

    this.loadEditor = function(index) {
      if (discardAlert()) {
        initEditor(index);
        ctrl.openEditor();
      }
    };

    this.savePost = function() {
      var type = ctrl.posting.type;
      var post = ctrl.posting.post;
      var postPromise;

      if (type === 'new') {
        postPromise = Posts.save(post).$promise;
      }
      else if (type === 'edit') {
        postPromise = Posts.update({id: ctrl.posting.id}, post).$promise;
      }

      postPromise.then(function(data) {
        if (type === 'new') {
          // Increment post count and recalculate ctrl.pageCount
          ctrl.thread.post_count++;
          calculatePages();
          // Go to last page in the thread and scroll to new post
          var lastPage = ctrl.pageCount;
          $location.search('page', lastPage).hash(data.id);
          if (ctrl.page === lastPage) { ctrl.pullPage(); }
        }
        else if (type === 'edit') {
          var index = ctrl.posting.index;
          var editPost = ctrl.posts[index];
          if (editPost.id === ctrl.posting.id) {
            editPost.body = data.body;
            editPost.raw_body = data.raw_body;
          }
        }

        initEditor();
        ctrl.closeEditor();
      })
      .catch(function(response) { Alert.error('Post could not be saved'); });
    };

    this.cancelPost = function() {
      if (discardAlert()) {
        initEditor();
        ctrl.closeEditor();
      }
    };

    this.deletePostIndex = -1;
    this.showDeleteModal = false;
    this.closeDeleteModal = function() {
      $timeout(function() { ctrl.showDeleteModal = false; });
    };
    this.openDeleteModal = function(index) {
      ctrl.deletePostIndex = index;
      ctrl.showDeleteModal = true;
    };
    this.deletePost = function() {
      var index = ctrl.deletePostIndex;
      var post = ctrl.posts && ctrl.posts[index] || '';
      if (post) {
        Posts.delete({id: post.id}).$promise
        .then(function() { post.deleted = true; })
        .catch(function(err) { Alert.error('Failed to delete post'); })
        .finally(function() { ctrl.showDeleteModal = false; });
      }
    };

    this.undeletePostIndex = -1;
    this.showUndeleteModal = false;
    this.closeUndeleteModal = function() {
      $timeout(function() { ctrl.showUndeleteModal = false; });
    };
    this.openUndeleteModal = function(index) {
      ctrl.undeletePostIndex = index;
      ctrl.showUndeleteModal = true;
    };
    this.undeletePost = function() {
      var index = ctrl.undeletePostIndex;
      var post = ctrl.posts && ctrl.posts[index] || '';
      if (post) {
        Posts.undelete({id: post.id}).$promise
        .then(function() { post.deleted = false; })
        .catch(function(err) { Alert.error('Failed to Undelete Post'); })
        .finally(function() { ctrl.showUndeleteModal = false; });
      }
    };

    this.purgePostIndex = -1;
    this.showPurgeModal = false;
    this.closePurgeModal = function() {
      $timeout(function() { ctrl.showPurgeModal = false; });
    };
    this.openPurgeModal = function(index) {
      ctrl.purgePostIndex = index;
      ctrl.showPurgeModal = true;
    };
    this.purgePost = function() {
      var index = ctrl.purgePostIndex;
      var post = ctrl.posts && ctrl.posts[index] || '';
      if (post) {
        Posts.purge({id: post.id}).$promise
        .then(function() { $state.go($state.$current, null, {reload:true}); })
        .catch(function(err) { Alert.error('Failed to purge Post'); })
        .finally(function() { ctrl.showPurgeModal = false; });
      }
    };

    var isFullscreen = true;
    this.fullscreen = function() {
      if (isFullscreen) {
        isFullscreen = false;
        this.editorPosition = 'editor-full-screen';
        this.resize = false;
      }
      else {
        isFullscreen = true;
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
