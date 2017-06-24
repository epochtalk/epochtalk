var ctrl = ['$rootScope', '$scope', '$anchorScroll','$location', '$timeout', '$stateParams', 'User', 'Auth', 'Alert', 'pageData',
  function($rootScope, $scope, $anchorScroll, $location, $timeout, $stateParams, User, Auth, Alert, pageData) {
    var ctrl = this;
    this.users = pageData.users;
    this.count = pageData.count;
    this.page = pageData.page;
    this.limit = pageData.limit;
    this.field = pageData.field;
    this.desc = pageData.desc;
    this.pageCount = pageData.page_count;
    this.search = pageData.search;
    this.queryParams = $location.search();
    this.searchStr = pageData.search;

    this.searchUsers = function() {
      ctrl.collapseMobileKeyboard();
      if (!ctrl.searchStr.length) {
        ctrl.clearSearch();
        return;
      }
      ctrl.queryParams = {
        filter: ctrl.filter,
        field: 'username',
        search: ctrl.searchStr
      };
      $location.search(ctrl.queryParams);
    };

    this.collapseMobileKeyboard = function() { document.activeElement.blur(); };

    this.clearSearch = function() {
      ctrl.queryParams = {
        field: 'username',
        filter: ctrl.filter
      };
      $location.search(ctrl.queryParams);
      ctrl.searchStr = null;
    };

    this.setSortField = function(sortField) {
      // Sort Field hasn't changed just toggle desc
      var unchanged = sortField === ctrl.field || (sortField === 'username' && !ctrl.field);
      if (unchanged) { ctrl.desc = ctrl.desc ? 'false' : 'true'; } // bool to str
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
      var desc = ctrl.desc;
      // Username is sorted asc by default
      if (sortField === 'username' && !ctrl.field && !desc) {
        sortClass = 'fa fa-sort-asc';
      }
      else if (ctrl.field === sortField && desc) {
        sortClass = 'fa fa-sort-desc';
      }
      else if (ctrl.field === sortField && !desc) {
        sortClass = 'fa fa-sort-asc';
      }
      else { sortClass = 'fa fa-sort'; }
      return sortClass;
    };

    $timeout($anchorScroll);

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
      var params = $location.search();
      var page = Number(params.page) || 1;
      var limit = Number(params.limit) || 15;
      var field = params.field;
      var search = params.search;
      var descending = params.desc === 'true';
      var pageChanged = false;
      var limitChanged = false;
      var fieldChanged = false;
      var descChanged = false;
      var searchChanged = false;

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
        ctrl.desc = descending;
      }
      if ((search === undefined || search) && search !== ctrl.search) {
        searchChanged = true;
        ctrl.search = search;
      }
      if(pageChanged || limitChanged || fieldChanged || descChanged || searchChanged) { ctrl.pullPage(); }
    });
    $scope.$on('$destroy', function() { ctrl.offLCS(); });

    this.pullPage = function() {
      var query = {
        page: ctrl.page,
        limit: ctrl.limit,
        desc: ctrl.desc,
        field: ctrl.field,
        search: ctrl.search
      };

      // replace current users with new users
      User.pagePublic(query).$promise
      .then(function(updatedData) {
        ctrl.users = updatedData.users;
        ctrl.count = updatedData.count;
        ctrl.page = updatedData.page;
        ctrl.limit = updatedData.limit;
        ctrl.field = updatedData.field;
        ctrl.desc = updatedData.desc;
        ctrl.search = updatedData.search;
        ctrl.pageCount = updatedData.page_count;
        $timeout($anchorScroll);
      });
    };

  }
];

module.exports = angular.module('ept.usersearch.ctrl', [])
.controller('UserSearchCtrl', ctrl)
.name;
