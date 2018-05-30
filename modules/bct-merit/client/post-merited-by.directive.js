var html = '<div class="post-footer" ng-if="vmPM.postMerits.length">' +
           'Merited by: ' +
           '  <span ng-repeat="merit in vmPM.postMerits track by merit.username">' +
           '    <a ui-sref="profile.posts({ username: merit.username})">{{merit.username}}</a>' +
           '    ({{merit.amount}})<span ng-hide="$last">, </span>' +
           '  </span>' +
           '</div>';

var directive = [function() {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { merits: '='},
    template: html,
    controllerAs: 'vmPM',
    controller: ['$scope', function($scope) {
      var ctrl = this;
      $scope.$watch(function() { return ctrl.merits; }, function(merits) {
        ctrl.postMerits = merits;
      });
    }]
  };
}];


angular.module('ept').directive('postMeritedBy', directive);
