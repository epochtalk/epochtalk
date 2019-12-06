var ctrl = ['$rootScope', '$scope', '$q', '$filter', '$location', '$timeout', '$anchorScroll', 'Alert', 'Session', 'Reports', 'Conversations', 'Posts', 'postReports', 'reportId', 'allReports', function($rootScope, $scope, $q, $filter, $location, $timeout, $anchorScroll, Alert, Session, Reports, Conversations, Posts, postReports, reportId, allReports) {
  var ctrl = this;
  this.parent = $scope.$parent.ModerationCtrl;
  this.parent.tab = 'posts';
  this.previewPost = null;
  this.previewReport = null;
  this.reportId = reportId;
  this.postReports = postReports.data;
  this.tableFilter = 0;
  if (postReports.filter === 'Pending') { this.tableFilter = 1; }
  else if (postReports.filter === 'Reviewed') { this.tableFilter = 2; }
  else if (postReports.filter === 'Ignored') { this.tableFilter = 3; }
  else if (postReports.filter === 'Bad Report') { this.tableFilter = 4; }

  // Permissions

  this.canUpdateUserReport = function() {
    var loggedIn = Session.isAuthenticated();
    var hasPermission = Session.hasPermission('reports.updateUserReport.allow');
    if (loggedIn && hasPermission) { return true; }
    else { return false; }
  };

  this.canCreateConversation = function() {
    var loggedIn = Session.isAuthenticated();
    var hasPermission = Session.hasPermission('conversations.create.allow');
    if (loggedIn && hasPermission) { return true; }
    else { return false; }
  };

  this.canBanUser = function() {
    var loggedIn = Session.isAuthenticated();
    var banPermission = Session.hasPermission('bans.ban.allow');
    var banBoardsPermission = Session.hasPermission('bans.banFromBoards.allow');
    if (loggedIn && (banPermission || banBoardsPermission)) { return true; }
    else { return false; }
  };

  this.canUpdatePost = function() {
    var moderates;
    var globalMod = ctrl.isGlobalModerator;
    var editPost = Session.hasPermission('posts.update.allow');
    if (ctrl.previewReport) { moderates = ctrl.moderatesBoard(ctrl.previewReport.board_id); }
    if (globalMod || moderates || !editPost) { return true; }
    else { return false; }
  };

  this.canDeletePost = function() {
    var moderates;
    var threadStarter;
    var reportExists = false;
    if (ctrl.previewReport) { reportExists = true;}

    var globalMod = ctrl.isGlobalModerator;
    var deletePost = Session.hasPermission('posts.delete.allow');
    if (reportExists) { threadStarter = ctrl.previewReport.offender_thread_starter; }
    if (reportExists) { moderates = ctrl.moderatesBoard(ctrl.previewReport.board_id); }

    if (threadStarter) { return false; }
    else if (globalMod || moderates || deletePost) { return true; }
    else { return false; }
  };

  this.canPurgePost = function() {
    var moderates;
    var threadStarter;
    var reportExists = false;
    if (ctrl.previewReport) { reportExists = true;}

    var globalMod = ctrl.isGlobalModerator;
    var deletePost = Session.hasPermission('posts.purge.allow');
    if (reportExists) { threadStarter = ctrl.previewReport.offender_thread_starter; }
    if (reportExists) { moderates = ctrl.moderatesBoard(ctrl.previewReport.board_id); }

    if (threadStarter) { return false; }
    else if (globalMod || moderates || deletePost) { return true; }
    else { return false; }
  };

  this.canSave = function() {
    var text = ctrl.posting.post.body_html;
    text = text.replace(/(<([^>]+)>)/ig,'');
    text = text.trim();
    return text.length > 0;
  };

  // Search Vars
  this.search = postReports.search;
  this.searchStr = postReports.search;
  this.count = postReports.count;

  // Report Pagination Vars
  this.pageCount = postReports.page_count;
  this.queryParams = $location.search();
  this.page = postReports.page;
  this.limit = postReports.limit;
  this.field = postReports.field;
  this.desc = postReports.desc;
  this.filter = postReports.filter;

  // Filter to only show reports in moderated boards
  this.allReports = allReports === 'true';
  this.moderatesBoard = Session.moderatesBoard;
  this.isGlobalModerator = Session.globalModeratorCheck();
  this.toggleModeratedBoards = function() {
    ctrl.selectedPostReport = null;
    ctrl.previewPost = null;
    if (ctrl.allReports) { ctrl.queryParams.allReports = undefined; }
    else { ctrl.queryParams.allReports = 'true'; }
    delete ctrl.queryParams.reportId;
    delete ctrl.queryParams.page;
    $location.search(ctrl.queryParams);
  };

  // Report Notes Vars
  this.reportNotes = null;
  this.reportNotesPage = null;
  this.reportNotesPageCount = null;
  this.reportNote = null;
  this.noteSubmitted = false;
  this.submitBtnLabel = 'Add Note';
  this.user = Session.user;

  // Set Status Vars
  this.showSetStatusModal  = false;
  this.setStatusSubmitted = false;
  this.setStatusBtnLabel = 'Confirm';
  this.selectedPostReport = null;
  this.selectedStatus = null;
  this.statusReportNote = null;

  this.searchReports = function() {
    if (!ctrl.searchStr || !ctrl.searchStr.length) {
      ctrl.clearSearch();
      return;
    }
    ctrl.queryParams = {
      filter: ctrl.filter,
      field: 'created_at',
      search: ctrl.searchStr,
      allReports: ctrl.allReports ? ctrl.allReports.toString() : undefined
    };
    ctrl.selectedPostReport = null;
    ctrl.previewPost = null;
    $location.search(ctrl.queryParams);
  };

  this.clearSearch = function() {
    ctrl.queryParams = {
      field: 'created_at',
      filter: ctrl.filter,
      reportId: ctrl.reportId,
      allReports: ctrl.allReports ? ctrl.allReports.toString() : undefined
    };
    $location.search(ctrl.queryParams);
    ctrl.searchStr = null;
  };

  this.showSetStatus = function(postReport) {
    ctrl.selectedPostReport = postReport;
    ctrl.showSetStatusModal = true;
    ctrl.selectedStatus = postReport.status;
  };

  this.closeSetStatus = function() {
    // Fix for modal not opening after closing
    $timeout(function() { ctrl.showSetStatusModal = false; });

    // Wait for modal to disappear then clear fields
    $timeout(function() {
      ctrl.selectedPostReport = null;
      ctrl.selectedStatus = null;
      ctrl.statusReportNote = null;
      ctrl.setStatusSubmitted = false;
      ctrl.setStatusBtnLabel = 'Confirm';
    }, 1000);
  };

  this.setStatus = function() {
    ctrl.setStatusSubmitted = true;
    ctrl.setStatusBtnLabel = 'Loading...';
    var updateReport = {
      id: ctrl.selectedPostReport.id,
      status: ctrl.selectedStatus,
      reviewer_user_id: ctrl.user.id
    };
    Reports.updatePostReport(updateReport).$promise
    .then(function(updatedReport) {
      ctrl.selectedPostReport.reviewer_user_id = updatedReport.reviewer_user_id;
      ctrl.selectedPostReport.status = updatedReport.status;
      ctrl.selectedPostReport.updated_at = updatedReport.updated_at;
      if (ctrl.previewReport) {
        ctrl.previewReport.reviewer_user_id = updatedReport.reviewer_user_id;
        ctrl.previewReport.status = updatedReport.status;
        ctrl.previewReport.updated_at = updatedReport.updated_at;
      }
      Alert.success('Report status has been set to ' + updatedReport.status);
      $timeout(function() { ctrl.closeSetStatus(); });
      return;
    })
    .then(function() {
      if (ctrl.statusReportNote) { // note is optional
        var params = {
          report_id: ctrl.selectedPostReport.id,
          user_id: ctrl.user.id,
          note: ctrl.statusReportNote
        };
        return Reports.createPostReportNote(params).$promise
        .then(function() {
          // Add note if report is currently being previewed
          if (ctrl.reportNotes && ctrl.previewReport.id === ctrl.selectedPostReport.id) {
            ctrl.pageReportNotes(ctrl.previewReport.id, ctrl.reportNotesPage);
          }
        });
      }
      else { return; }
    })
    .catch(function(err) {
      var msg = 'There was an error updating the report.';
      if (err && err.data) { msg = err.data.message; }
      Alert.error(msg);
      ctrl.closeSetStatus();
    });
  };

  this.showManageBans = function(user) {
    ctrl.selectedUser = user;
    ctrl.showManageBansModal = true;
  };

  this.updateReportBans = function(params) {
    // Loop reports and update ban info on reports with matching offender ids
    for (var i = 0; i < ctrl.postReports.length; i++) {
      if (params.user_id === ctrl.postReports[i].offender_author_id) {
        if (!params.banError && params.expiration) {
          // unbanning sets ban expiration to current time
          var expiration = new Date(params.expiration) > new Date() ? params.expiration : undefined;
          ctrl.postReports[i].offender_ban_expiration = expiration;
          // Handle updating ban info on report being previewed
          if (ctrl.previewReport && ctrl.postReports[i].id === ctrl.previewReport.id) {
            ctrl.previewReport.offender_ban_expiration = expiration;
          }
        }
        // Handle Board Bans update
        if (!params.boardBanError) {
          ctrl.postReports[i].offender_board_banned = params.board_banned;
        }
      }
    }
  };

  this.updateReportNote = function(note) {
    delete note.edit;
    note.report_id = ctrl.reportId;
    Reports.updatePostReportNote(note).$promise
    .then(function(updatedNote) {
      for (var i = 0; i < ctrl.reportNotes.length; i++) {
        if (ctrl.reportNotes[i].id === note.id) {
          ctrl.reportNotes[i] = updatedNote;
          break;
        }
      }
      Alert.success('Note successfully updated');
    })
    .catch(function(err) {
      note.note = note.noteCopy;
      delete note.noteCopy;
      Alert.error('Error: ' + err.data.message);
    });
  };

  this.submitReportNote = function() {
    ctrl.submitBtnLabel = 'Submitting...';
    ctrl.noteSubmitted = true;
    var params = {
      report_id: ctrl.reportId,
      user_id: ctrl.user.id,
      note: ctrl.reportNote
    };
    Reports.createPostReportNote(params).$promise
    .then(function() {
      ctrl.submitBtnLabel = 'Add Note';
      ctrl.noteSubmitted = false;
      ctrl.reportNote = null;
      Alert.success('Note successfully created');
      ctrl.pageReportNotes(ctrl.reportId, ctrl.reportNotesPage);
    });
  };

  this.showPreview = function(report) {
    ctrl.previewReport = report;
    ctrl.reportId = report.id;

    Posts.get({ id: report.offender_post_id }).$promise
    .then(function(post) {
      ctrl.previewPost = post;
    });

    ctrl.pageReportNotes(report.id);
  };

  this.deselectReport = function() {
    ctrl.reportId = null;
    ctrl.previewPost = null;
    ctrl.previewReport = null;
    var params = $location.search();
    delete params.reportId;
    $location.search(params);
  };

  this.selectReport = function(postReport, initialPageLoad) {
    // do nothing if user is being selected to be banned
    // this prevents the row highlight when clicking links
    // within the row
    if (ctrl.selectedUser || ctrl.selectedPostReport) { return; }

    // Clear Report Notes
    ctrl.reportNotes = null;
    ctrl.reportNote = null;
    ctrl.noteSubmitted = false;
    if (ctrl.reportId === postReport.id && !initialPageLoad) { ctrl.deselectReport(); }
    else {
      if (!initialPageLoad) { $location.search('reportId', postReport.id); }
      ctrl.showPreview(postReport);
    }
    // Update so pagination knows reportId changed
    ctrl.queryParams.reportId = ctrl.reportId;
  };

  this.pageReportNotes = function(reportId, page) {
    Reports.pagePostReportsNotes({ report_id: reportId, page: page }).$promise
    .then(function(reportNotes) {
      ctrl.reportNotes = reportNotes.data;
      ctrl.reportNotesPage = reportNotes.page;
      ctrl.reportNotesPageCount = reportNotes.page_count;
    });
  };

  // Handles case where users links directly to selected report
  // Default to all reports
  if (this.reportId && this.postReports.length) {
    for (var i = 0; i < this.postReports.length; i++) {
      var curReport = this.postReports[i];
      if (curReport.id === this.reportId) {
        this.selectReport(curReport, true);
        break;
      }
    }
  }

  this.setFilter = function(newFilter) {
    ctrl.queryParams.filter = newFilter;
    delete ctrl.queryParams.reportId;
    delete ctrl.queryParams.search;
    delete ctrl.queryParams.page;
    $location.search(ctrl.queryParams);
    ctrl.reportId = null;
    ctrl.previewPost = null;
    ctrl.searchStr = null;
  };

  this.setSortField = function(sortField) {
    // Sort Field hasn't changed just toggle desc
    var unchanged = sortField === ctrl.field;
    if (unchanged) { ctrl.desc = ctrl.desc.toString() === 'true' ? 'false' : 'true'; } // bool to str
    // Sort Field changed default to ascending order
    else { ctrl.desc = 'false'; }
    ctrl.field = sortField;
    ctrl.page = 1;
    $location.search('page', ctrl.page);
    $location.search('desc', ctrl.desc);
    $location.search('field', sortField);

    // Update queryParams (forces pagination to refresh)
    ctrl.queryParams = $location.search();
  };

  this.getSortClass = function(sortField) {
    var sortClass;
    var desc;
    // if desc param is undefined default to true if sorting by created_at
    if ($location.search().desc === undefined && sortField === 'created_at') { desc = true; }
    else { desc = ctrl.desc === 'true'; }
    // created_at is sorted desc by default when ctrl.field is not present
    if (sortField === 'created_at' && !ctrl.field && desc) { sortClass = 'fa fa-sort-desc'; }
    else if (ctrl.field === sortField && desc) { sortClass = 'fa fa-sort-desc'; }
    else if (ctrl.field === sortField && !desc) { sortClass = 'fa fa-sort-asc'; }
    else { sortClass = 'fa fa-sort'; }
    return sortClass;
  };

  // Purge, Delete, Undelete Post
  this.showPostConfirmModal = false;
  this.postActionSubmitted = false;
  this.postActionParams = null;
  this.postActionBtnLabel = 'Confirm';
  this.showPostConfirm = function(params) {
    ctrl.postActionParams = params;
    ctrl.showPostConfirmModal = true;
  };

  this.closePostConfirm = function() {
    ctrl.postActionSubmitted = false;
    $timeout(function() { ctrl.showPostConfirmModal = false; });
    $timeout(function() {
      ctrl.postActionParams = null;
      ctrl.postActionBtnLabel = 'Confirm';
    }, 1000);
  };

  this.postAction = function() {
    ctrl.postActionBtnLabel = 'Loading...';
    ctrl.postActionSubmitted = true;
    var promiseParam = { id: ctrl.postActionParams.postId };
    var promise, errMsg, successMsg;
    if (ctrl.postActionParams.purge) {
      promise = Posts.purge(promiseParam).$promise;
      successMsg = 'Post successfully purged';
      errMsg = 'There was an error purging the post';
    }
    else if (ctrl.postActionParams.delete) {
      promise = Posts.delete(promiseParam).$promise;
      successMsg = 'Post successfully hidden';
      errMsg = 'There was an error hiding the post';
    }
    else if (ctrl.postActionParams.undelete) {
      promise = Posts.undelete(promiseParam).$promise;
      successMsg = 'Post successfully unhidden';
      errMsg = 'There was an error unhiding the post';
    }
    promise.then(function(post) {
      ctrl.previewPost = post;
      Alert.success(successMsg);
      // deselect report if post was purged
      if (ctrl.postActionParams.purge) { ctrl.deselectReport(); }
    })
    .catch(function() { Alert.error(errMsg); })
    .finally(function() { ctrl.closePostConfirm(); });
  };

  // Warn users
  this.newConversation = {};
  this.showWarnModal = false;
  this.warnSubmitted = false;
  this.warnBtnLabel = 'Send Warning';

  this.createConversation = function() {
    ctrl.warnSubmitted = true;
    ctrl.warnBtnLabel = 'Sending...';
    // create a new conversation id to put this message under
    var newMessage = {
      receiver_ids: [ctrl.newConversation.receiver_id],
      content: {
        subject: '[WARNING] Reported Post',
        body: ctrl.newConversation.body,
      }
    };

    Conversations.save(newMessage).$promise
    .then(function() {
      Alert.success('Warning has been sent to ' + ctrl.selectedUser.username);
    })
    .catch(function() { Alert.error('There was an error warning ' +  ctrl.selectedUser.username); })
    .finally(function() { ctrl.closeWarn(); });
  };

  this.showWarn = function(user) {
    ctrl.selectedUser = user;
    ctrl.newConversation.receiver_id = user.id;
    ctrl.showWarnModal = true;
  };

  this.closeWarn = function() {
    ctrl.selectedUser = null;
    ctrl.warnSubmitted = false;
    // Fix for modal not opening after closing
    $timeout(function() { ctrl.showWarnModal = false; });

    // Wait for modal to disappear then clear fields
    $timeout(function() {
      ctrl.newConversation = {};
      ctrl.warnBtnLabel = 'Send Warning';
    }, 1000);
  };

  //editor specific
  this.dirtyEditor = false;
  this.resetEditor = false;
  this.showEditor = false;
  this.focusEditor = false;
  this.posting = { post: { body_html: '', body: '' } };
  this.editorPosition = 'editor-fixed-bottom';
  this.resize = true;

  this.savePost = function() {
    var post = ctrl.posting.post;
    Posts.update(post).$promise
    .then(function(data) {
      ctrl.previewPost.body_html = data.body_html;
      ctrl.previewPost.body = data.body;
      Alert.success('Post successfully updated');
    })
    .catch(function(err) {
      var error = 'Post could not be updated';
      if (err.status === 429) { error = 'Post Rate Limit Exceeded'; }
      if (err.status === 403) { error = 'You do not have the proper permissions to update this post'; }
      Alert.error(error);
    })
    .finally(closeEditor);
  };

  this.loadEditor = function() {
    ctrl.loadPost(ctrl.previewPost);
  };

  this.loadPost = function(post) {
    var editorPost = ctrl.posting.post;
    editorPost.thread_id = post.thread_id;
    editorPost.title = post.title || '';
    editorPost.id = post.id || '';
    editorPost.body_html = post.body_html || '';
    editorPost.body = post.body || '';
    ctrl.resetEditor = true;
    ctrl.showEditor = true;
    ctrl.focusEditor = true;
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
      this.editorPosition = 'editor-fixed-right';
      this.resize = true;
    }
  };

  function closeEditor() {
    ctrl.posting.post.body = '';
    ctrl.posting.post.body_html = '';
    ctrl.resetEditor = true;
    ctrl.showEditor = false;
  }

  this.cancelPost = function() { closeEditor(); };

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 15;
    var field = params.field;
    var filter = params.filter;
    var search = params.search;
    var reportId = params.reportId;
    var allReports = params.allReports;
    var descending;
    // desc when undefined defaults to true, since we are sorting created_at desc by default
    if (params.desc === undefined) { descending = true; }
    else { descending = params.desc === 'true'; }
    var pageChanged = false;
    var limitChanged = false;
    var fieldChanged = false;
    var descChanged = false;
    var filterChanged = false;
    var searchChanged = false;
    var reportIdChanged = false;
    var allReportsChanged = false;

    if (page && page !== ctrl.page) {
      pageChanged = true;
      ctrl.page = page;
    }
    if (limit && limit !== ctrl.limit) {
      limitChanged = true;
      ctrl.limit = limit;
    }
    if (field && field !== ctrl.field) {
      fieldChanged = true;
      ctrl.field = field;
    }
    if (descending !== ctrl.desc) {
      descChanged = true;
      ctrl.desc = descending.toString();
    }
    if ((filter === undefined || filter) && filter !== ctrl.filter) {
      filterChanged = true;
      ctrl.filter = filter;
    }
    if ((search === undefined || search) && search !== ctrl.search) {
      searchChanged = true;
      ctrl.search = search;
    }
    if ((reportId === undefined || reportId) && reportId !== ctrl.reportId) {
      reportIdChanged = true;
      ctrl.reportId = reportId;
    }
    if (((allReports === undefined && ctrl.allReports !== false) || allReports) && allReports !== ctrl.allReports) {
      allReportsChanged = true;
      ctrl.allReports = allReports;
    }
    if(pageChanged || limitChanged || fieldChanged || descChanged || filterChanged || searchChanged || reportIdChanged || allReportsChanged) { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var showAllReports = ctrl.allReports === 'true' || ctrl.isGlobalModerator;

    var query = {
      page: ctrl.page,
      limit: ctrl.limit,
      desc: ctrl.desc,
      field: ctrl.field,
      filter: ctrl.filter,
      search: ctrl.search,
      mod_id: showAllReports ? undefined : ctrl.user.id
    };

    // replace current reports with new reports
    Reports.pagePostReports(query).$promise
    .then(function(newReports) {
      ctrl.postReports = newReports.data;
      ctrl.count = newReports.count;
      ctrl.pageCount = newReports.page_count;
    });
  };
}];

require('../../modules/ept-posts/directives/editor.directive');
require('../../modules/ept-posts/directives/resizeable.directive');
require('../../modules/ept-images/image-uploader.directive');

module.exports = angular.module('ept.admin.moderation.posts.ctrl', [])
.controller('ModPostsCtrl', ctrl);
