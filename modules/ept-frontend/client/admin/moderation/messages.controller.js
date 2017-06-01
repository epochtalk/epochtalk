var difference = require('lodash/difference');

var ctrl = ['$rootScope', '$scope', '$q', '$filter', '$location', '$timeout', '$anchorScroll', 'Alert', 'Session', 'Reports', 'Messages', 'Conversations', 'messageReports', 'reportId', function($rootScope, $scope, $q, $filter, $location, $timeout, $anchorScroll, Alert, Session, Reports, Messages, Conversations, messageReports, reportId) {
  var ctrl = this;
  this.parent = $scope.$parent.ModerationCtrl;
  this.parent.tab = 'messages';
  this.previewReport = null;
  this.reportId = reportId;
  this.messageReports = messageReports.data;
  this.tableFilter = 0;
  if (messageReports.filter === 'Pending') { this.tableFilter = 1; }
  else if (messageReports.filter === 'Reviewed') { this.tableFilter = 2; }
  else if (messageReports.filter === 'Ignored') { this.tableFilter = 3; }
  else if (messageReports.filter === 'Bad Report') { this.tableFilter = 4; }

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
    var banPermission = Session.hasPermission('bans.privilegedBan');
    var banBoardsPermission = Session.hasPermission('bans.privilegedBanFromBoards');
    if (loggedIn && (banPermission || banBoardsPermission)) { return true; }
    else { return false; }
  };

  this.canDeleteMessage = function() {
    var loggedIn = Session.isAuthenticated();
    var hasPermission = Session.hasPermission('messages.delete.allow');
    if (loggedIn && hasPermission) { return true; }
    else { return false; }
  };

  // Search Vars
  this.search = messageReports.search;
  this.searchStr = messageReports.search;
  this.count = messageReports.count;

  // Report Pagination Vars
  this.pageCount = messageReports.page_count;
  this.queryParams = $location.search();
  this.page = messageReports.page;
  this.limit = messageReports.limit;
  this.field = messageReports.field;
  this.desc = messageReports.desc;
  this.filter = messageReports.filter;

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
  this.selectedMessageReport = null;
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
    ctrl.selectedMessageReport = null;
    ctrl.previewReport = null;
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

  this.showSetStatus = function(messageReport) {
    ctrl.selectedMessageReport = messageReport;
    ctrl.showSetStatusModal = true;
    ctrl.selectedStatus = messageReport.status;
  };

  this.closeSetStatus = function() {
    // Fix for modal not opening after closing
    $timeout(function() { ctrl.showSetStatusModal = false; });

    // Wait for modal to disappear then clear fields
    $timeout(function() {
      ctrl.selectedMessageReport = null;
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
      id: ctrl.selectedMessageReport.id,
      status: ctrl.selectedStatus,
      reviewer_user_id: ctrl.user.id
    };
    Reports.updateMessageReport(updateReport).$promise
    .then(function(updatedReport) {
      ctrl.selectedMessageReport.reviewer_user_id = updatedReport.reviewer_user_id;
      ctrl.selectedMessageReport.status = updatedReport.status;
      ctrl.selectedMessageReport.updated_at = updatedReport.updated_at;
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
          report_id: ctrl.selectedMessageReport.id,
          user_id: ctrl.user.id,
          note: ctrl.statusReportNote
        };
        return Reports.createMessageReportNote(params).$promise
        .then(function() {
          // Add note if report is currently being previewed
          if (ctrl.reportNotes && ctrl.previewReport.id === ctrl.selectedMessageReport.id) {
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
    for (var i = 0; i < ctrl.messageReports.length; i++) {
      if (params.user_id === ctrl.messageReports[i].offender_author_id) {
        // unbanning sets ban expiration to current time
        if (!params.banError && params.expiration) {
          var expiration = new Date(params.expiration) > new Date() ? params.expiration : undefined;
          ctrl.messageReports[i].offender_ban_expiration = expiration;
          // Handle updating ban info on report being previewed
          if (ctrl.previewReport && ctrl.messageReports[i].id === ctrl.previewReport.id) {
            ctrl.previewReport.offender_ban_expiration = expiration;
          }
        }
        // Handle Board Bans update
        if (!params.boardBanError) {
          ctrl.messageReports[i].offender_board_banned = params.board_banned;
        }
      }
    }
  };

  this.updateReportNote = function(note) {
    delete note.edit;
    note.report_id = ctrl.reportId;
    Reports.updateMessageReportNote(note).$promise
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
    Reports.createMessageReportNote(params).$promise
    .then(function() {
      ctrl.submitBtnLabel = 'Add Note';
      ctrl.noteSubmitted = false;
      ctrl.reportNote = null;
      Alert.success('Note successfully created');
      ctrl.pageReportNotes(ctrl.reportId, ctrl.reportNotesPage);
    });
  };

  this.deselectReport = function() {
    ctrl.reportId = null;
    ctrl.previewReport = null;
    var params = $location.search();
    delete params.reportId;
    $location.search(params);
  };

  this.selectReport = function(messageReport, initialPageLoad) {
    // do nothing if user is being selected to be banned
    // this prevents the row highlight when clicking links
    // within the row
    if (ctrl.selectedUser || ctrl.selectedMessageReport) { return; }
    // Clear Report Notes
    ctrl.reportNotes = null;
    ctrl.reportNote = null;
    ctrl.noteSubmitted = false;
    if (ctrl.reportId === messageReport.id && !initialPageLoad) { ctrl.deselectReport(); }
    else {
      if (!initialPageLoad) { $location.search('reportId', messageReport.id); }
      ctrl.previewReport = messageReport;
      ctrl.reportId = messageReport.id;
      ctrl.pageReportNotes(ctrl.reportId);
    }
    // Update so pagination knows reportId changed
    ctrl.queryParams.reportId = ctrl.reportId;
  };

  this.pageReportNotes = function(reportId, page) {
    Reports.pageMessageReportsNotes({ report_id: reportId, page: page }).$promise
    .then(function(reportNotes) {
      ctrl.reportNotes = reportNotes.data;
      ctrl.reportNotesPage = reportNotes.page;
      ctrl.reportNotesPageCount = reportNotes.page_count;
    });
  };

  // Handles case where users links directly to selected report
  if (this.reportId && this.messageReports.length) {
    for (var i = 0; i < this.messageReports.length; i++) {
      var curReport = this.messageReports[i];
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
    ctrl.searchStr = null;
    ctrl.previewReport = null;
    ctrl.selectedMessageReport = null;
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
      receiver_id: ctrl.newConversation.receiver_id,
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

  this.messageToPurgeId = null;
  this.showConfirmPurgeModal = false;
  this.purgeSubmitted = false;
  this.purgeBtnLabel = 'Confirm';

  this.showConfirmPurge = function(id) {
    ctrl.messageToPurgeId = id;
    ctrl.showConfirmPurgeModal = true;
  };

  this.closeConfirmPurge = function() {
    ctrl.messageToPurgeId = null;
    ctrl.purgeSubmitted = false;
    // Fix for modal not opening after closing
    $timeout(function() { ctrl.showConfirmPurgeModal = false; });

    // Wait for modal to disappear then clear fields
    $timeout(function() { ctrl.purgeBtnLabel = 'Confirm'; }, 1000);
  };

  this.purgeMessage = function() {
    ctrl.purgeSubmitted = true;
    ctrl.purgeBtnLabel = 'Loading...';
    Messages.delete({ id: ctrl.messageToPurgeId }).$promise
    .then(function() {
      Alert.success('Successfully purged message');
      ctrl.deselectReport();
    })
    .catch(function() { Alert.error('There was an error purging this message'); })
    .finally(function() { ctrl.closeConfirmPurge(); });
  };

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 15;
    var field = params.field;
    var filter = params.filter;
    var search = params.search;
    var reportId = params.reportId;
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
    if(pageChanged || limitChanged || fieldChanged || descChanged || filterChanged || searchChanged || reportIdChanged) { ctrl.pullPage(); }
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

    // replace current reports with new mods
    Reports.pageMessageReports(query).$promise
    .then(function(newReports) {
      ctrl.messageReports = newReports.data;
      ctrl.count = newReports.count;
      ctrl.pageCount = newReports.page_count;
    });
  };
}];
require('../../components/ban_modal/ban-modal.directive');

module.exports = angular.module('ept.admin.moderation.messages.ctrl', [])
.controller('ModMessagesCtrl', ctrl);
