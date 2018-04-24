var directive = ['Ranks', 'Alert', '$timeout', function(Ads, Alert, $timeout) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { },
    template: require('./rank-manager.directive.html'),
    controllerAs: 'vm',
    controller: ['$scope', function($scope) {
      var ctrl = this;
    }]
  };
}];

angular.module('ept').directive('rank-manager', directive);
