module.exports = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'AdminUsers', 'moderators', 'moderatorsCount', 'filter', 'page', 'limit', 'field', 'desc', function($rootScope, $scope, $location, $timeout, $anchorScroll, AdminUsers, moderators, moderatorsCount, filter, page, limit, field, desc) {
  var ctrl = this;
  this.parent = $scope.$parent;
  this.parent.tab = 'moderators';
  this.selectedFilterIndex = 0;
  this.pageCount =  Math.ceil(moderatorsCount / limit);
  this.moderators = moderators;
  this.queryParams = $location.search();
  this.page = page;
  this.limit = limit;
  this.field = field;
  this.desc = desc;
  this.filter = filter;

  this.addModerator = function(user) {
    console.log(user);
  };

  this.setFilter = function(newFilter) {
    ctrl.filter = newFilter;
    ctrl.queryParams.filter = newFilter;
    $location.search(ctrl.queryParams);
  };

  this.setSortField = function(sortField) {
    // Sort Field hasn't changed just toggle desc
    var unchanged = sortField === ctrl.field || (sortField === 'username' && !ctrl.field);
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
    var sortDesc = ctrl.desc === 'true'; // str to bool
    // Username is sorted asc by default
    if (sortField === 'username' && !ctrl.field && !sortDesc) {
      sortClass = 'fa fa-sort-asc';
    }
    else if (ctrl.field === sortField && sortDesc) {
      sortClass = 'fa fa-sort-desc';
    }
    else if (ctrl.field === sortField && !sortDesc) {
      sortClass = 'fa fa-sort-asc';
    }
    else { sortClass = 'fa fa-sort'; }
    return sortClass;
  };

  this.isGlobalMod = function(role) {
    return role === 'Global Moderator';
  };

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function(){
    var params = $location.search();
    var filter = params.filter;
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 10;
    var field = params.field;
    var descending = params.desc === 'true';
    var filterChanged = false;
    var pageChanged = false;
    var limitChanged = false;
    var fieldChanged = false;
    var descChanged = false;

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
    if (filter && filter !== ctrl.filter) {
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
    AdminUsers.countModerators({ filter: query.filter }).$promise
    .then(function(updatedCount) {
      ctrl.pageCount = Math.ceil(updatedCount.count / limit);
    });

    // replace current mods with new mods
    AdminUsers.pageModerators(query).$promise
    .then(function(newModerators) {
      ctrl.moderators = newModerators;
      $timeout($anchorScroll);
    });
  };
}];
