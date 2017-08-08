var html = `
  <h5 class="thin-underline section-header-top-spacing">Announcement Configuration</h5>
  <div class="setting-row">
    <div class="switch-desc">
      <label for="main-only">Main Page Only</label>
      <label class="desc-label" for="main-only">If enabled, the announcement is only shown on the main page. If disabled, the announcement is show on every page</label>
    </div>
    <div class="switch-block">
      <input id="main-only" class="toggle-switch" type="checkbox" ng-model="vmMotdAdmin.data.main_view_only">
      <label for="main-only"></label>
    </div>
  </div>
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

      $scope.child.saveSettings = function() {
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
