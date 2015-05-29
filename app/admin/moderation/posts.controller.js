module.exports = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'Session', 'AdminReports', 'Posts', 'postReports', 'reportCount', 'page', 'limit', 'field', 'desc', 'filter', 'reportId', function($rootScope, $scope, $location, $timeout, $anchorScroll, Session, AdminReports, Posts, postReports, reportCount, page, limit, field, desc, filter, reportId) {
  var ctrl = this;
  this.parent = $scope.$parent;
  this.parent.tab = 'posts';
  this.tableFilter = 0;
  this.previewPost = null;
  this.previewReport = null;
  this.reportId = reportId;
  this.postReports = postReports;

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

  // Handles case where users links directly to selected report
  if (this.reportId && this.postReports.length) {
    for (var i = 0; i < this.postReports.length; i++) {
      var curReport = this.postReports[i];
      if (curReport.id === this.reportId) {
        this.showPreview(curReport);
        break;
      }
    }
  }

  this.selectPostReport = function(postReport) {
    // Clear Report Notes
    ctrl.reportNotes = null;
    ctrl.reportNote = null;
    ctrl.noteSubmitted = false;
    if (ctrl.reportId === postReport.id) {
      ctrl.reportId = null;
      ctrl.previewPost = null;
      ctrl.previewReport = null;
      var params = $location.search();
      delete params.reportId;
      $location.search(params);
    }
    else {
      $location.search('reportId', postReport.id);
      ctrl.showPreview(postReport);
    }
    // Update so pagination knows reportId changed
    ctrl.queryParams.reportId = ctrl.reportId;
  };

  this.setFilter = function(newFilter) {
    ctrl.queryParams.filter = newFilter;
    delete ctrl.queryParams.reportId;
    $location.search(ctrl.queryParams);
    ctrl.reportId = null;
    ctrl.previewPost = null;
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
    var descending;
    // desc when undefined defaults to true, since we are sorting created_at desc by default
    if (params.desc === undefined) { descending = true; }
    else { descending = params.desc === 'true'; }
    var filter = params.filter;
    var pageChanged = false;
    var limitChanged = false;
    var fieldChanged = false;
    var descChanged = false;
    var filterChanged = false;

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
    if(pageChanged || limitChanged || fieldChanged || descChanged || filterChanged) { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      page: ctrl.page,
      limit: ctrl.limit
    };

    if (ctrl.desc) { query.desc = ctrl.desc; }
    if (ctrl.field) { query.field = ctrl.field; }
    if (ctrl.filter) { query.filter = ctrl.filter; }

    // update mods's page count
    AdminReports.postReportsCount({ status: query.filter }).$promise
    .then(function(updatedCount) {
      ctrl.pageCount = Math.ceil(updatedCount.count / limit);
    });

    // replace current reports with new mods
    AdminReports.pagePostReports(query).$promise
    .then(function(newReports) {
      ctrl.postReports = newReports;
    });
  };
}];
