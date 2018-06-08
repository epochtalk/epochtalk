var directive = [function() {
  return {
    restrict: 'E',
    replace: true,
    template: require('./merit-permissions-layout.html'),
  };
}];


angular.module('ept').directive('meritPermissionsLayout', directive);
