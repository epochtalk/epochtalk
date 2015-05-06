module.exports = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'AdminUsers', 'admins', 'adminsCount', 'page', 'limit', 'field', 'desc', function($rootScope, $scope, $location, $timeout, $anchorScroll, AdminUsers, admins, adminsCount, page, limit, field, desc) {
  var ctrl = this;
  this.parent = $scope.$parent;
  this.parent.tab = 'administrators';
  this.admins = admins;
  this.tableFilter = 0;
  this.pageCount =  Math.ceil(adminsCount / limit);
  this.admins = admins;
  this.queryParams = $location.search();
  this.page = page;
  this.limit = limit;
  this.field = field;
  this.desc = desc;

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

  this.isSuperAdmin = function(role) {
    return role === 'Super Administrator';
  };

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function(){
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 10;
    var field = params.field;
    var descending = params.desc === 'true';
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

    if(pageChanged || limitChanged || fieldChanged || descChanged) { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      page: ctrl.page,
      limit: ctrl.limit
    };

    if (ctrl.desc) { query.desc = ctrl.desc; }
    if (ctrl.field) { query.field = ctrl.field; }

    // update admin's page count
    AdminUsers.countAdmins().$promise
    .then(function(updatedCount) {
      ctrl.pageCount = Math.ceil(updatedCount.count / limit);
    });

    // replace current admins with new admins
    AdminUsers.pageAdmins(query).$promise
    .then(function(newAdmins) {
      ctrl.admins = newAdmins;
      $timeout($anchorScroll);
    });
  };
}];
