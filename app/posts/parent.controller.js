var ctrl = [ '$scope', '$timeout', '$location', '$filter', '$state', 'Session', 'AdminBoards', 'Posts', 'Threads', 'Reports', 'Alert', 'BreadcrumbSvc',
  function($scope, $timeout, $location, $filter, $state, Session, AdminBoards, Posts, Threads, Reports, Alert, BreadcrumbSvc) {
    var ctrl = this;
    this.loggedIn = Session.isAuthenticated;
    this.dirtyEditor = false;
    this.resetEditor = false;
    this.showEditor = false;
    this.focusEditor = false;
    this.quote = '';
    this.posting = { post: { body: '', raw_body: '' } };
    this.editorPosition = 'editor-fixed-bottom';
    this.resize = true;
    this.moveBoard = {};
    this.boards = [];
    this.addPoll = false;
    this.resetPoll = false;
    this.poll = { question: '', answers: ['',''] };
    this.pollValid = false;

    // Report Permission
    this.reportControlAccess = {
      reportPosts: Session.hasPermission('reports.createPostReport'),
      reportUsers: Session.hasPermission('reports.createUsersReport')
    };

    // Thread Permissions
    this.canEditTitle = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (ctrl.bannedFromBoard) { return false; }
      if (!Session.hasPermission('threads.title.allow')) { return false; }

      var title = false;
      if (ctrl.thread.user.id === Session.user.id) { title = true; }
      else {
        if (Session.hasPermission('threads.title.bypass.owner.admin')) { title = true; }
        else if (Session.hasPermission('threads.title.bypass.owner.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id)) { title = true; }
        }
      }
      return title;
    };

    this.canLock = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (ctrl.bannedFromBoard) { return false; }
      if (!Session.hasPermission('threads.lock.allow')) { return false; }

      var lock = false;
      if (ctrl.thread.user.id === Session.user.id) { lock = true; }
      else {
        if (Session.hasPermission('threads.lock.bypass.owner.admin')) { lock = true; }
        else if (Session.hasPermission('threads.lock.bypass.owner.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id)) { lock = true; }
        }
      }
      return lock;
    };

    this.canSticky = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (ctrl.bannedFromBoard) { return false; }
      if (!Session.hasPermission('threads.sticky.allow')) { return false; }

      var sticky = false;
      if (Session.hasPermission('threads.sticky.bypass.owner.admin')) { sticky = true; }
      else if (Session.hasPermission('threads.sticky.bypass.owner.mod')) {
        if (Session.moderatesBoard(ctrl.thread.board_id)) { sticky = true; }
      }
      return sticky;
    };

    this.canPurge = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (ctrl.bannedFromBoard) { return false; }
      if (!Session.hasPermission('threads.purge.allow')) { return false; }

      var purge = false;
      if (Session.hasPermission('threads.purge.bypass.owner.admin')) { purge = true; }
      else if (Session.hasPermission('threads.purge.bypass.owner.mod')) {
        if (Session.moderatesBoard(ctrl.thread.board_id)) { purge = true; }
      }
      return purge;
    };

    this.canMove = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (ctrl.bannedFromBoard) { return false; }
      if (!Session.hasPermission('threads.move.allow')) { return false; }

      var move = false;
      if (Session.hasPermission('threads.move.bypass.owner.admin')) { move = true; }
      else if (Session.hasPermission('threads.move.bypass.owner.mod')) {
        if (Session.moderatesBoard(ctrl.thread.board_id)) { move = true; }
      }
      return move;
    };

    this.showUserControls = function() {
      if (!ctrl.loggedIn()) { return false; }

      var show = false;
      if (!ctrl.thread.watched) { show = true; }
      if (ctrl.canCreatePoll()) { show = true; }
      return show;
    };

    this.showThreadControls = function() {
      if (!ctrl.loggedIn()) { return false; }

      var show = false;
      if (ctrl.canLock()) { show = true; }
      if (ctrl.canSticky()) { show = true; }
      if (ctrl.canPurge()) { show = true; }
      if (ctrl.canMove()) { show = true; }
      return show;
    };

    // Poll Permissions
    this.canCreatePoll = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (ctrl.thread.poll) { return false; }
      if (ctrl.bannedFromBoard) { return false; }
      if (!Session.hasPermission('threads.createPoll.allow')) { return false; }

      var create = false;
      if (ctrl.thread.user.id === Session.user.id) { create = true; }
      else {
        if (Session.hasPermission('threads.createPoll.bypass.owner.admin')) { create = true; }
        else if (Session.hasPermission('threads.createPoll.bypass.owner.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id)) { create = true; }
        }
      }
      return create;
    };

    // Post Permissions
    this.canPost = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (ctrl.bannedFromBoard) { return false; }
      if (!Session.hasPermission('posts.create.allow')) { return false; }

      if (ctrl.thread.locked) {
        if (Session.hasPermission('posts.create.bypass.locked.admin')) { return true; }
        else if (Session.hasPermission('posts.create.bypass.locked.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id)) { return true; }
        }
        else { return false; }
      }

      return true;
    };

    // wait for board_id to be populated by child controller
    $scope.$watch(function() { return ctrl.board_id; }, function(boardId) {
      ctrl.getBoards(boardId); // get boards for mods and admins
    });

    this.getBoards = function(boardId) {
      if (ctrl.canMove()) {
        return AdminBoards.moveBoards().$promise
        .then(function(allBoards) {
          ctrl.boards = allBoards || [];
          ctrl.boards.map(function(board) {
            if (board.id === boardId) { ctrl.moveBoard = board; }
            board.name = $filter('decode')(board.name); // decode html entities
          });
        });
      }
    };

    /* Thread Methods */

    var threadTitle = '';
    this.editThread = false;
    this.openEditThread = function() {
      threadTitle = ctrl.thread.title;
      ctrl.editThread = true;
    };
    this.closeEditThread = function() {
      ctrl.editThread = false;
      ctrl.thread.title = threadTitle;
    };
    this.updateThreadTitle = function() {
      var title = ctrl.thread.title;
      return Threads.title({id: ctrl.thread.id}, {title: title}).$promise
      .then(function() { ctrl.editThread = false; })
      .then(function() {
        Alert.success('Thread\'s title changed to: ' + title);
        BreadcrumbSvc.updateLabelInPlace(title);
      })
      .catch(function() { Alert.error('Error changing thread title'); });
    };

    this.updateThreadLock = function() {
      // let angular digest the change in lock status
      $timeout(function() {
        var newLockStatus = !ctrl.thread.locked;
        return Threads.lock({id: ctrl.thread.id}, {status: newLockStatus}).$promise
        .then(function(lockThread) { ctrl.thread.locked = lockThread.locked; })
        .catch(function() {
          var type = newLockStatus ? 'Locking' : 'Unlocking';
          Alert.error('Error ' + type + ' Thread');
        });
      });
    };

    this.updateThreadSticky = function() {
      // let angular digest the change in lock status
      $timeout(function() {
        var newStickyStatus = !ctrl.thread.sticky;
        return Threads.sticky({id: ctrl.thread.id}, {status: newStickyStatus}).$promise
        .then(function(stickyThread) { ctrl.thread.sticky = stickyThread.sticky; })
        .catch(function() {
          var type = newStickyStatus ? 'Stickying' : 'Unstickying';
          Alert.error('Error ' + type + ' Thread');
        });
      });
    };

    this.moveThread = function() {
      var newBoardId = ctrl.moveBoard.id;
      return Threads.move({id: ctrl.thread.id}, {newBoardId: newBoardId}).$promise
      .then(function() { $state.go($state.$current, null, {reload:true}); })
      .catch(function() { Alert.error('Error Moving Thread'); });
    };

    this.showPurgeThreadModal = false;
    this.closePurgeThreadModal = function() {
      $timeout(function() { ctrl.showPurgeThreadModal = false; });
    };
    this.openPurgeThreadModal = function() { ctrl.showPurgeThreadModal = true; };
    this.purgeThread = function() {
      Threads.delete({id: ctrl.thread.id}).$promise
      .then(function() { $state.go('threads.data', {boardId: ctrl.board_id}); })
      .catch(function() { Alert.error('Error Purging Thread'); })
      .finally(function() { ctrl.showPurgeThreadModal = false; });
    };

    /* Poll Methods */

    this.createPoll = function() {
      var requestParams = { threadId: ctrl.thread.id };
      Threads.createPoll(requestParams, ctrl.poll).$promise
      .then(function(data) {
        ctrl.thread.poll = data;
        ctrl.addPoll = false;
        ctrl.resetPoll = true;
      })
      .catch(function() { Alert.error('There was an error creating the poll'); });
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
      ctrl.posting.post.raw_body = '';
      ctrl.posting.post.body = '';
      ctrl.resetEditor = true;
      ctrl.showEditor = false;
    }

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
        var post = (ctrl.posts && ctrl.posts[index]) || {};
        ctrl.posting.index = index;
        var editorPost = ctrl.posting.post;
        editorPost.id = post.id || '';
        editorPost.title = post.title || '';
        editorPost.body = post.body || '';
        editorPost.raw_body = post.raw_body || '';
        ctrl.resetEditor = true;
        ctrl.showEditor = true;
        ctrl.focusEditor = true;
      }
    };

    this.savePost = function() {
      var post = ctrl.posting.post;
      var type = post.id ? 'update' : 'create';
      post.title = post.title || 'Re: ' + ctrl.thread.title;
      post.thread_id = ctrl.thread.id;

      var postPromise;
      if (post.id) { postPromise = Posts.update(post).$promise; }
      else { postPromise = Posts.save(post).$promise; }

      postPromise.then(function(data) {
        if (type === 'create') {
          // Increment post count and recalculate ctrl.pageCount
          ctrl.thread.post_count++;
          ctrl.pageCount = Math.ceil(ctrl.thread.post_count / ctrl.limit);
          // Go to last page in the thread and scroll to new post
          var lastPage = ctrl.pageCount;
          $location.search('page', lastPage).hash(data.id);
          if (ctrl.page === lastPage) { ctrl.pullPage(); }
        }
        else if (type === 'update') {
          var editPost = ctrl.posts[ctrl.posting.index];
          editPost.body = data.body;
          editPost.raw_body = data.raw_body;
          editPost.updated_at = data.updated_at;
        }
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
    this.showDeleteModal = false;
    this.openDeleteModal = function(index) {
      ctrl.deletePostIndex = index;
      ctrl.showDeleteModal = true;
    };
    this.deletePost = function() {
      ctrl.showDeleteModal = false;
      var index = ctrl.deletePostIndex;
      var post = ctrl.posts && ctrl.posts[index] || '';
      if (post) {
        Posts.delete({id: post.id}).$promise
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

module.exports = angular.module('ept.posts.parentCtrl', [])
.controller('PostsParentCtrl', ctrl)
.name;
