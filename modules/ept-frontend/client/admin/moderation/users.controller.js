var ctrl = ['$rootScope', '$scope', '$q', '$filter', '$location', '$timeout', '$anchorScroll', 'User', 'Alert', 'Session', 'Reports', 'Conversations', 'userReports', 'reportId', function($rootScope, $scope, $q, $filter, $location, $timeout, $anchorScroll, User, Alert, Session, Reports, Conversations, userReports, reportId) {
  var ctrl = this;
  this.parent = $scope.$parent.ModerationCtrl;
  this.parent.tab = 'users';
  this.userReports = userReports.data;
  this.reportId = reportId;
  this.previewReport = null;
  this.selectedUsername = null;
  this.tableFilter = 0;
  if (userReports.filter === 'Pending') { this.tableFilter = 1; }
  else if (userReports.filter === 'Reviewed') { this.tableFilter = 2; }
  else if (userReports.filter === 'Ignored') { this.tableFilter = 3; }
  else if (userReports.filter === 'Bad Report') { this.tableFilter = 4; }

  this.currentUser = {};

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

  // Search Vars
  this.search = userReports.search;
  this.searchStr = userReports.search;
  this.count = userReports.count;

  // Report Pagination Vars
  this.pageCount = userReports.page_count;
  this.queryParams = $location.search();
  this.page = userReports.page;
  this.limit = userReports.limit;
  this.field = userReports.field;
  this.desc = userReports.desc;
  this.filter = userReports.filter;

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
  this.selectedUserReport = null;
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
      search: ctrl.searchStr
    };
    ctrl.selectedUserReport = null;
    ctrl.reportId = null;
    ctrl.selectedUsername = null;
    $location.search(ctrl.queryParams);
  };

  this.clearSearch = function() {
    ctrl.queryParams = {
      field: 'created_at',
      filter: ctrl.filter,
      reportId: ctrl.reportId
    };
    $location.search(ctrl.queryParams);
    ctrl.searchStr = null;
  };

  this.showSetStatus = function(userReport) {
    ctrl.selectedUserReport = userReport;
    ctrl.showSetStatusModal = true;
    ctrl.selectedStatus = userReport.status;
  };

  this.closeSetStatus = function() {
    // Fix for modal not opening after closing
    $timeout(function() { ctrl.showSetStatusModal = false; });

    // Wait for modal to disappear then clear fields
    $timeout(function() {
      ctrl.selectedUserReport = null;
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
      id: ctrl.selectedUserReport.id,
      status: ctrl.selectedStatus,
      reviewer_user_id: ctrl.user.id
    };
    Reports.updateUserReport(updateReport).$promise
    .then(function(updatedReport) {
      ctrl.selectedUserReport.reviewer_user_id = updatedReport.reviewer_user_id;
      ctrl.selectedUserReport.status = updatedReport.status;
      ctrl.selectedUserReport.updated_at = updatedReport.updated_at;

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
          report_id: ctrl.selectedUserReport.id,
          user_id: ctrl.user.id,
          note: ctrl.statusReportNote
        };
        return Reports.createUserReportNote(params).$promise
        .then(function() {
          // Add note if report is currently being previewed
          if (ctrl.reportNotes && ctrl.previewReport.id === ctrl.selectedUserReport.id) {
            ctrl.pageReportNotes(ctrl.previewReport.id, ctrl.reportNotesPage);
          }
        });
      }
      else { return; }
    });
  };

  this.showManageBans = function(user) {
    ctrl.selectedUser = user;
    ctrl.showManageBansModal = true;
  };

  this.updateReportBans = function(params) {
    // Loop reports and update ban info on reports with matching offender ids
    for (var i = 0; i < ctrl.userReports.length; i++) {
      if (params.user_id === ctrl.userReports[i].offender_user_id) {
        if (!params.banError && params.expiration) {
          // unbanning sets ban expiration to current time
          var expiration = new Date(params.expiration) > new Date() ? params.expiration : undefined;
          ctrl.userReports[i].offender_ban_expiration = expiration;
          // Handle updating ban info on report being previewed
          if (ctrl.previewReport && ctrl.userReports[i].id === ctrl.previewReport.id) {
            ctrl.previewReport.offender_ban_expiration = expiration;
          }
        }
        // Handle Board Bans update
        if (!params.boardBanError) {
          ctrl.userReports[i].offender_board_banned = params.board_banned;
        }
      }
    }
  };

  this.updateReportNote = function(note) {
    delete note.edit;
    note.report_id = ctrl.reportId;
    Reports.updateUserReportNote(note).$promise
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
    Reports.createUserReportNote(params).$promise
    .then(function() {
      ctrl.submitBtnLabel = 'Add Note';
      ctrl.noteSubmitted = false;
      ctrl.reportNote = null;
      Alert.success('Note successfully created');
      ctrl.pageReportNotes(ctrl.reportId, ctrl.reportNotesPage);
    });
  };

  this.selectReport = function(userReport, initialPageLoad) {
    // do nothing if user is being selected to be banned
    // this prevents the row highlight when clicking links
    // within the row
    if (ctrl.selectedUser || ctrl.selectedUserReport) { return; }
    // Clear Report Notes
    ctrl.reportNotes = null;
    ctrl.reportNote = null;
    ctrl.noteSubmitted = false;
    if (userReport.id === ctrl.reportId && !initialPageLoad) {
      var params = $location.search();
      delete params.reportId;
      $location.search(params);
      ctrl.reportId = null;
      ctrl.selectedUsername = null;
      ctrl.previewReport = null;
    }
    else {
      if (!initialPageLoad) { $location.search('reportId', userReport.id); }
      ctrl.selectedUsername = userReport.offender_username;
      ctrl.previewReport = userReport;

      ctrl.pageReportNotes(userReport.id);

      if (initialPageLoad) {
        User.get({ id: ctrl.selectedUsername }).$promise
        .then(function(user) { ctrl.currentUser = user; });
      }
    }
  };

  this.pageReportNotes = function(reportId, page) {
    Reports.pageUserReportsNotes({ report_id: reportId, page: page }).$promise
    .then(function(reportNotes) {
      ctrl.reportNotes = reportNotes.data;
      ctrl.reportNotesPage = reportNotes.page;
      ctrl.reportNotesPageCount = reportNotes.page_count;
    });
  };

  // Handles case when linking to this state with reportId in query string already populated
  if (this.reportId && this.userReports.length) {
    for (var i = 0; i < this.userReports.length; i++) {
      var curReport = this.userReports[i];
      if (this.reportId === curReport.id) {
        ctrl.selectReport(curReport, true);

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
    ctrl.selectedUsername = null;
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
      subject:'[WARNING] User Report',
      body: ctrl.newConversation.body,
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

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function(){
    var params = $location.search();
    var reportId = params.reportId;
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 15;
    var field = params.field;
    var filter = params.filter;
    var search = params.search;
    var descending;
    // desc when undefined defaults to true, since we are sorting created_at desc by default
    if (params.desc === undefined) { descending = true; }
    else { descending = params.desc === 'true'; }
    var reportIdChanged = false;
    var pageChanged = false;
    var limitChanged = false;
    var fieldChanged = false;
    var descChanged = false;
    var filterChanged = false;
    var searchChanged = false;

    if ((reportId === undefined || reportId) && reportId !== ctrl.reportId) {
      reportIdChanged = true;
      ctrl.reportId = reportId;
      ctrl.queryParams.reportId = ctrl.reportId;
    }
    if (page && page !== ctrl.page) {
      pageChanged = true;
      ctrl.parent.page = page;
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
    if(reportIdChanged || pageChanged || limitChanged || fieldChanged || descChanged || filterChanged || searchChanged) { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      page: ctrl.page,
      limit: ctrl.limit,
      desc: ctrl.desc,
      field: ctrl.field,
      filter: ctrl.filter,
      search: ctrl.search
    };

    // replace current reports with new reports
    Reports.pageUserReports(query).$promise
    .then(function(newReports) {
      ctrl.userReports = newReports.data;
      ctrl.count = newReports.count;
      ctrl.pageCount = newReports.page_count;
    });

    // Location has already been updated using location.search, reload only child state
    if (ctrl.selectedUsername && ctrl.selectedUsername !== ctrl.currentUser.username) {
      User.get({ id: ctrl.selectedUsername }).$promise
      .then(function(user) { ctrl.currentUser = user; });
    }
  };
}];

// include the profile directive
require('../../components/profile/profile.directive.js');
require('../../components/usernotes/usernotes.directive.js');
require('../../components/image_uploader/image_uploader.directive');
require('../../components/ban_modal/ban-modal.directive');

module.exports = angular.module('ept.admin.moderation.users.ctrl', [])
.controller('ModUsersCtrl', ctrl);
