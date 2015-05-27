module.exports = ['$rootScope', '$scope', '$state', '$location', '$timeout', '$anchorScroll', 'AdminReports', 'User', 'userReports', 'reportCount', 'page', 'limit', 'field', 'desc', 'filter', 'reportId', function($rootScope, $scope, $state, $location, $timeout, $anchorScroll, AdminReports, User, userReports, reportCount, page, limit, field, desc, filter, reportId) {
  var ctrl = this;
  this.parent = $scope.$parent;
  this.parent.tab = 'users';
  this.userReports = userReports;
  this.tableFilter = 0;
  this.reportId = reportId;
  this.selectedUsername = null;
  this.pageCount = Math.ceil(reportCount / limit);
  this.queryParams = $location.search();
  this.page = page;
  this.limit = limit;
  this.field = field;
  this.desc = desc;
  this.filter = filter;

  this.selectReport = function(userReport) {
    if (userReport.id === ctrl.reportId) {
      var params = $location.search();
      delete params.reportId;
      $location.search(params);
      ctrl.reportId = null;
      ctrl.selectedUsername = null;
    }
    else {
      $location.search('reportId', userReport.id);
      ctrl.selectedUsername = userReport.offender_username;
    }
  };

  // Handles case when linking to this state with reportId in query string already populated
  if (this.reportId && this.userReports.length) {
    for (var i = 0; i < this.userReports.length; i++) {
      var curReport = this.userReports[i];
      if (this.reportId === curReport.id) {
        ctrl.selectReport(curReport);
        break;
      }
    }
  }

  this.setFilter = function(newFilter) {
    ctrl.queryParams.filter = newFilter;
    delete ctrl.queryParams.reportId;
    $location.search(ctrl.queryParams);
    ctrl.reportId = null;
    ctrl.selectedUsername = null;
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

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function(){
    var params = $location.search();
    var reportId = params.reportId;
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 10;
    var descending;
    // desc when undefined defaults to true, since we are sorting created_at desc by default
    if (params.desc === undefined) { descending = true; }
    else { descending = params.desc === 'true'; }
    var filter = params.filter;
    var reportIdChanged = false;
    var pageChanged = false;
    var limitChanged = false;
    var fieldChanged = false;
    var descChanged = false;
    var filterChanged = false;

    if (reportId && reportId !== ctrl.reportId) {
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
    if(reportIdChanged || pageChanged || limitChanged || fieldChanged || descChanged || filterChanged) { ctrl.pullPage(); }
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
    AdminReports.userReportsCount({ status: query.filter }).$promise
    .then(function(updatedCount) {
      ctrl.pageCount = Math.ceil(updatedCount.count / limit);
    });

    // replace current reports with new mods
    AdminReports.pageUserReports(query).$promise
    .then(function(newReports) {
      ctrl.userReports = newReports;
    });

    // Location has already been updated using location.search, reload only child state
    $state.go('admin-moderation.users.preview', { username: ctrl.selectedUsername }, { location: false, reload: 'admin-moderation.users.preview' });
  };
}];
