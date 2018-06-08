var html = '<li><a ng-click="AdminManagementCtrl.selectedTab = \'merit\'" ng-class="{\'active\' : AdminManagementCtrl.selectedTab === \'merit\'}" ng-href="#">Merit</a></li>';

var directive = [function() {
  return {
    restrict: 'E',
    replace: true,
    template: html
  };
}];


angular.module('ept').directive('meritPermissionsTab', directive);
