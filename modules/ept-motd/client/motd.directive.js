var html = `<div ng-if="vmMotd.data.motd_html.length" id="motd-wrap"><div id="motd" post-processing="vmMotd.data.motd_html" style-fix="true"></div></div>`;

var directive = ['Motd', function(Motd) {
  return {
    restrict: 'E',
    template: html,
    scope: true,
    controllerAs: 'vmMotd',
    controller: [function() {
      var ctrl = this;

      this.data = '';

      Motd.get().$promise
      .then(function(data) {
        ctrl.data = data;
      })
      .catch(function(err) {
        console.log(err);
      });

    }]
  };
}];


angular.module('ept').directive('motd', directive);
