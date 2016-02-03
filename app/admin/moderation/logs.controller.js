var ctrl = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'AdminModerationLogs', 'moderationLogs', function($rootScope, $scope, $location, $timeout, $anchorScroll, AdminModerationLogs, moderationLogs) {
  var ctrl = this;
  this.parent = $scope.$parent.ModerationCtrl;
  this.parent.tab = 'logs';
  this.logs = moderationLogs.data;

  // Pagination Vars
  this.pageCount = moderationLogs.page_count;
  this.queryParams = $location.search();
  this.page = moderationLogs.page;
  this.limit = moderationLogs.limit;
  this.filterCol = moderationLogs.filterCol;
  this.filter = moderationLogs.filter;

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 15;
    var filterCol = params.filterCol;
    var filter = params.filter;

    var pageChanged = false;
    var limitChanged = false;
    var filterColChanged = false;
    var filterChanged = false;

    if (page && page !== ctrl.page) {
      pageChanged = true;
      ctrl.page = page;
    }
    if (limit && limit !== ctrl.limit) {
      limitChanged = true;
      ctrl.limit = limit;
    }
    if (filterColChanged && filterCol !== ctrl.filterCol) {
      filterColChanged = true;
      ctrl.filterCol = filterCol;
    }
    if ((filter === undefined || filter) && filter !== ctrl.filter) {
      filterChanged = true;
      ctrl.filter = filter;
    }
    if(pageChanged || limitChanged || filterChanged || filterColChanged) { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      page: ctrl.page,
      limit: ctrl.limit,
      filter: ctrl.filter,
      filterCol: ctrl.filterCol
    };

    // replace current reports with new mods
    AdminModerationLogs.page(query).$promise
    .then(function(newLogs) {
      ctrl.logs = newLogs.data;
      ctrl.count = newLogs.count;
      ctrl.pageCount = newLogs.page_count;
    });
  };
}];

module.exports = angular.module('ept.admin.moderation.logs.ctrl', [])
.controller('ModLogsCtrl', ctrl)
.name;
