var directive = ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./admin-projects.html'),
    controllerAs: 'vm',
    controller: [function() {
      var ctrl = this;

      $timeout(function() {

      });

    }]
  };
}];

angular.module('ept').directive('adminProjects', directive);


