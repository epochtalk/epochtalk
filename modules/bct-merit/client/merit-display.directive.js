var html = '<div ng-if="vmM.userMerit > -1" title="Merit: {{vmM.userMerit}}">Merit: {{vmM.userMerit}}</div>' +
           '<a ng-if="vmM.username" ui-sref="merit({ username: vmM.username })">View Merit Statistics</a>';

var directive = [function() {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { merit: '=', username: '=' },
    template: html,
    controllerAs: 'vmM',
    controller: ['$scope', function($scope) {
      var ctrl = this;
      $scope.$watch(function() { return ctrl.merit; }, function(merit) {
        ctrl.userMerit = merit;
      });
    }]
  };
}];


angular.module('ept').directive('meritDisplay', directive);
