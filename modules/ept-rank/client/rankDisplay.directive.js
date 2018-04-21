var html= '{{vm.user}}';

var directive = [function() {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { user: '='},
    template: html,
    controllerAs: 'vm',
    controller: [function() {
      var ctrl = this;

    }]
  };
}];


angular.module('ept').directive('rankDisplay', directive);
