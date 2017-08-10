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
  <label class="desc-label">
    This is an announcement message that will be shown at the
    top of the page to all users.
  </label>
  <textarea id="motd" ng-model="vmMotdAdmin.data.motd"></textarea>
  <label ng-if="vmMotdAdmin.preview.length">Announcement Preview</label>
  <div ng-if="vmMotdAdmin.preview.length" class="boxed-section">
    <div class="content" post-processing="vmMotdAdmin.preview" style-fix="false"></div>
  </div>
`;

var directive = ['Motd', function(Motd) {
  return {
    restrict: 'E',
    template: html,
    scope: true,
    controllerAs: 'vmMotdAdmin',
    controller: ['$window', '$scope', function($window, $scope) {
      var ctrl = this;

      this.data = '';
      this.preview = '';

      $scope.child.saveSettings = function() {
        Motd.save(ctrl.data).$promise
        .catch(console.log);
      };

      $scope.$watch(function() { return ctrl.data.motd; }, function() {  parseInput(); });

      function parseInput() {
        var processed = ctrl.data.motd;
        $window.parsers.forEach(function(parser) {
          processed = parser.parse(processed);
        });
        ctrl.preview = processed;
      }

      Motd.get().$promise
      .then(function(data) {
        ctrl.data = data;
        parseInput();
      })
      .catch(console.log);

    }]
  };
}];


angular.module('ept').directive('motdAdmin', directive);
