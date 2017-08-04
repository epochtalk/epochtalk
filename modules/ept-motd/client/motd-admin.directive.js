var html = `
  <h5 class="thin-underline section-header-top-spacing">Announcement Configuration</h5>
  <label for="motd">Announcement Text</label>
  <textarea ng-model="vmMotdAdmin.data.motd"></textarea>

`;

var directive = ['Motd', function(Motd) {
  return {
    restrict: 'E',
    template: html,
    scope: true,
    controllerAs: 'vmMotdAdmin',
    controller: ['$scope', function($scope) {
      var ctrl = this;

      this.data = '';

       $scope.child.save = function() {
          Motd.save(ctrl.data).$promise
          .catch(console.log);
       };

      Motd.get().$promise
      .then(function(data) {
        ctrl.data = data;
      })
      .catch(console.log);

    }]
  };
}];


angular.module('ept').directive('motdAdmin', directive);
