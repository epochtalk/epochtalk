var html = `<div ng-if="vmMotd.data.motd_html.length && !vmMotd.hideAnnnouncement" id="motd-wrap"><div id="motd" post-processing="vmMotd.data.motd_html" style-fix="true"></div></div>`;

var directive = ['Motd', function(Motd) {
  return {
    restrict: 'E',
    template: html,
    scope: true,
    controllerAs: 'vmMotd',
    controller: ['$rootScope', '$state', function($rootScope, $state) {
      var ctrl = this;

      this.data = '';
      this.hideAnnnouncement = false;

      $rootScope.$on('$locationChangeSuccess', function() {
        mainViewOnlyCheck();
      });

      function mainViewOnlyCheck() {
        if (ctrl.data.main_view_only) {
          var curState = $state.current.name;
          // Only show on main views
          if (curState !== 'boards' && curState !== 'home' && curState !== 'portal') {
            ctrl.hideAnnnouncement = true;
          }
        }
      }

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
