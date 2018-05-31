var html = '<div ng-if="vm.userMerit > -1" title="Merit: {{vm.userMerit}}">Merit: {{vm.userMerit}}</div>';

var directive = [function() {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { merit: '='},
    template: html,
    controllerAs: 'vm',
    controller: ['$scope', function($scope) {
      var ctrl = this;
      $scope.$watch(function() { return ctrl.merit; }, function(merit) {
        ctrl.userMerit = merit;
      });
    }]
  };
}];


angular.module('ept').directive('meritDisplay', directive);
