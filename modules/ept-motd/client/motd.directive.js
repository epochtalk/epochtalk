var html = `<div ng-if="vmMotd.data.motd_html.length && !vmMotd.hideAnnnouncement" id="motd-wrap"><div id="motd" post-processing="vmMotd.data.motd_html" style-fix="true"></div></div>`;

var directive = ['Motd', function(Motd) {
  return {
    restrict: 'E',
    template: html,
    scope: true,
    controllerAs: 'vmMotd',
    controller: ['$rootScope', '$location', function($rootScope, $location) {
      var ctrl = this;

      this.data = '';
      this.hideAnnnouncement = false;

      function mainViewOnlyCheck() {
        if (ctrl.data.main_view_only) {
          var curPath = $location.path();
          // Only show on main views
          if (curPath !== '/boards' && curPath !== '' && curPath !== '/') {
            ctrl.hideAnnnouncement = true;
          }
          else { ctrl.hideAnnnouncement = false; }
        }
      }

      // Enforces the main view only preference
      $rootScope.$on('$locationChangeSuccess', function() {  mainViewOnlyCheck(); });

      Motd.get().$promise
      .then(function(data) {
        ctrl.data = data;
        mainViewOnlyCheck();
      })
      .catch(function(err) {
        console.log(err);
      });

    }]
  };
}];


angular.module('ept').directive('motd', directive);
