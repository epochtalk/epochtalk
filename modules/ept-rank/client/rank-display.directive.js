var html= `Ranks: {{vm.ranks}}
  <br> Maps: {{vm.maps}}
  <br> User: {{vm.user}}`;

var directive = [function() {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { ranks: '=', maps: '=', user: '='},
    template: html,
    controllerAs: 'vm',
    controller: [function() {
      var ctrl = this;

      console.log(ctrl.ranks);
      console.log(ctrl.user);
      console.log(ctrl.maps);

    }]
  };
}];


angular.module('ept').directive('rankDisplay', directive);
