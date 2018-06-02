var html = '<div ng-if="vmM.userMerit > -1" title="Merit: {{vmM.userMerit}}">Merit: {{vmM.userMerit}}</div>' +
           '<a ng-if="vmM.loggedIn() && vmM.username" ui-sref="merit({ username: vmM.username })">View Merit Statistics</a>';

var directive = ['Session', function(Session) {
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

      this.loggedIn = Session.isAuthenticated;
    }]
  };
}];


angular.module('ept').directive('meritDisplay', directive);
