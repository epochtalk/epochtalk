var directive = ['Ranks', 'Alert', '$timeout', function(Ranks, Alert, $timeout) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { },
    template: require('./rank-manager.directive.html'),
    controllerAs: 'vm',
    controller: ['$scope', function($scope) {
      var ctrl = this;

      Ranks.get().$promise
      .then(function(ranks) {
        ctrl.ranks = ranks;
      });

    }]
  };
}];

angular.module('ept').directive('rankManager', directive);
