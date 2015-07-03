module.exports = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'Session', 'AdminReports', 'AdminUsers', 'Posts', 'postReports', 'reportCount', 'page', 'limit', 'field', 'desc', 'filter', 'search', 'reportId', function($rootScope, $scope, $location, $timeout, $anchorScroll, Session, AdminReports, AdminUsers, Posts, postReports, reportCount, page, limit, field, desc, filter, search, reportId) {
  var ctrl = this;
  this.parent = $scope.$parent;
  this.parent.tab = 'posts';
  this.previewPost = null;
  this.previewReport = null;
  this.reportId = reportId;
  this.postReports = postReports;
  this.tableFilter = 0;
  if (filter === 'Pending') { this.tableFilter = 1; }
  else if (filter === 'Reviewed') { this.tableFilter = 2; }

  // Search Vars
  this.search = search;
  this.searchStr = null;
  this.count = reportCount;

  // Report Pagination Vars
  this.pageCount = Math.ceil(reportCount / limit);
  this.queryParams = $location.search();
  this.page = page;
  this.limit = limit;
  this.field = field;
  this.desc = desc;
  this.filter = filter;

  // Report Notes Vars
  this.reportNotes = null;
  this.reportNote = null;
  this.noteSubmitted = false;
  this.submitBtnLabel = 'Add Note';
  this.user = Session.user;

  // Banning Vars
  this.showConfirmBanModal = false; // confirmation ban modal visible bool
  this.showConfirmUnbanModal = false; // confirmation unban modal visible bool
  this.banSubmitted = false; // form submitted bool
  this.selectedUser = null; //  model backing selected user
  this.confirmBanBtnLabel = 'Confirm'; // modal button label
  this.permanentBan = undefined; // boolean indicating if ban is permanent
  this.banUntil = null; // model

  // Set Status Vars
  this.showSetStatusModal  = false;
  this.setStatusSubmitted = false;
  this.setStatusBtnLabel = 'Confirm';
  this.selectedPostReport = null;
  this.selectedStatus = null;
  this.statusReportNote = null;

  this.searchReports = function() {
    if (!ctrl.searchStr.length) {
      ctrl.clearSearch();
      return;
    }
    ctrl.queryParams = {
      filter: ctrl.filter,
      field: 'created_at',
      search: ctrl.searchStr
    };
    $location.search(ctrl.queryParams);
  };

  this.clearSearch = function() {
    ctrl.queryParams = {
      field: 'created_at',
      filter: ctrl.filter
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
    AdminReports.updatePostReport(updateReport).$promise
    .then(function(updatedReport) {
      ctrl.selectedPostReport.reviewer_user_id = updatedReport.reviewer_user_id;
      ctrl.selectedPostReport.status = updatedReport.status;
      ctrl.selectedPostReport.updated_at = updatedReport.updated_at;
      if (ctrl.previewReport) {
        ctrl.previewReport.reviewer_user_id = updatedReport.reviewer_user_id;
        ctrl.previewReport.status = updatedReport.status;
        ctrl.previewReport.updated_at = updatedReport.updated_at;
      }
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
        return AdminReports.createPostReportNote(params).$promise
        .then(function(createdNote) {
          // Add note if report is currently being previewed
          if (ctrl.reportNotes && ctrl.previewReport.id === ctrl.selectedPostReport.id) {
            ctrl.reportNotes.push(createdNote);
          }
        });
      }
      else { return; }
    });
  };

  this.minDate = function() {
    var d = new Date();
    var month = '' + (d.getMonth() + 1);
    var day = '' + d.getDate();
    var year = d.getFullYear();
    if (month.length < 2) { month = '0' + month; }
    if (day.length < 2) { day = '0' + day; }
    return [year, month, day].join('-');
  };

  this.showBanConfirm = function(user) {
    ctrl.selectedUser = user;
    ctrl.showConfirmBanModal = true;
  };

  this.closeConfirmBan = function() {
    ctrl.selectedUser = null;
    ctrl.permanentBan = undefined;
    ctrl.banUntil = null;

    // Fix for modal not opening after closing
    $timeout(function() { ctrl.showConfirmBanModal = false; });
  };

  this.banUser = function() {
    ctrl.confirmBanBtnLabel = 'Loading...';
    ctrl.banSubmitted = true;
    var params = {
      user_id: ctrl.selectedUser.id,
      expiration: ctrl.banUntil || undefined
    };
    AdminUsers.ban(params).$promise
    .then(function() {
      ctrl.closeConfirmBan();
      ctrl.pullPage();
      $timeout(function() { // wait for modal to close
        ctrl.confirmBanBtnLabel = 'Confirm';
        ctrl.banSubmitted = false;
      }, 500);
    });
  };

  this.showUnbanConfirm = function(user) {
    ctrl.selectedUser = user;
    ctrl.showConfirmUnbanModal = true;
  };

  this.closeConfirmUnban = function() {
    ctrl.selectedUser = null;
    // Fix for modal not opening after closing
    $timeout(function() { ctrl.showConfirmUnbanModal = false; });
  };

  this.unbanUser = function() {
    ctrl.confirmBanBtnLabel = 'Loading...';
    ctrl.banSubmitted = true;
    var params = {
      user_id: ctrl.selectedUser.id,
    };
    AdminUsers.unban(params).$promise
    .then(function() {
      ctrl.closeConfirmUnban();
      ctrl.pullPage();
      $timeout(function() { // wait for modal to close
        ctrl.confirmBanBtnLabel = 'Confirm';
        ctrl.banSubmitted = false;
      }, 500);
    });
  };

  this.updateReportNote = function(note) {
    delete note.edit;
    AdminReports.updatePostReportNote(note).$promise
    .then(function(updatedNote) {
      for (var i = 0; i < ctrl.reportNotes.length; i++) {
        if (ctrl.reportNotes[i].id === note.id) {
          ctrl.reportNotes[i] = updatedNote;
          break;
        }
      }
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
    AdminReports.createPostReportNote(params).$promise
    .then(function(createdNote) {
      ctrl.reportNotes.push(createdNote);
      ctrl.submitBtnLabel = 'Add Note';
      ctrl.noteSubmitted = false;
      ctrl.reportNote = null;
    });
  };

  this.showPreview = function(report) {
    ctrl.previewReport = report;
    ctrl.reportId = report.id;

    Posts.get({ id: report.offender_post_id }).$promise
    .then(function(post) {
      ctrl.previewPost = post;
    });

    AdminReports.pagePostReportsNotes({ report_id: report.id, limit: 'all' }).$promise
    .then(function(reportNotes) {
      ctrl.reportNotes = reportNotes;
    });
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
    if (ctrl.reportId === postReport.id && !initialPageLoad) {
      ctrl.reportId = null;
      ctrl.previewPost = null;
      ctrl.previewReport = null;
      var params = $location.search();
      delete params.reportId;
      $location.search(params);
    }
    else {
      if (!initialPageLoad) { $location.search('reportId', postReport.id); }
      ctrl.showPreview(postReport);
    }
    // Update so pagination knows reportId changed
    ctrl.queryParams.reportId = ctrl.reportId;
  };

  // Handles case where users links directly to selected report
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
    $location.search(ctrl.queryParams);
    ctrl.reportId = null;
    ctrl.previewPost = null;
    ctrl.searchStr = null;
  };

  this.setSortField = function(sortField) {
    // Sort Field hasn't changed just toggle desc
    var unchanged = sortField === ctrl.field;
    if (unchanged) { ctrl.desc = ctrl.desc === 'true' ? 'false' : 'true'; } // bool to str
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
    var sortDesc;
    // if desc param is undefined default to true if sorting by created_at
    if ($location.search().desc === undefined && sortField === 'created_at') { sortDesc = true; }
    else { sortDesc = ctrl.desc === 'true'; }
    // created_at is sorted desc by default when ctrl.field is not present
    if (sortField === 'created_at' && !ctrl.field && sortDesc) { sortClass = 'fa fa-sort-desc'; }
    else if (ctrl.field === sortField && sortDesc) { sortClass = 'fa fa-sort-desc'; }
    else if (ctrl.field === sortField && !sortDesc) { sortClass = 'fa fa-sort-asc'; }
    else { sortClass = 'fa fa-sort'; }
    return sortClass;
  };

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 10;
    var field = params.field;
    var filter = params.filter;
    var search = params.search;
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
    if(pageChanged || limitChanged || fieldChanged || descChanged || filterChanged || searchChanged) { ctrl.pullPage(); }
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

    var opts;
    if (ctrl.filter || ctrl.search) {
      opts = {
        status: ctrl.filter,
        search: ctrl.search
      };
    }

    // update mods's page count
    AdminReports.postReportsCount(opts).$promise
    .then(function(updatedCount) {
      ctrl.count = updatedCount.count;
      ctrl.pageCount = Math.ceil(updatedCount.count / limit);
    });

    // replace current reports with new mods
    AdminReports.pagePostReports(query).$promise
    .then(function(newReports) {
      ctrl.postReports = newReports;
    });
  };
}];
