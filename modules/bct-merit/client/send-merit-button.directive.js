var html = '<li>' +
           '  <a ng-href="#" data-balloon="Merit Post" ng-click="PostsParentCtrl.meritPost = post; PostsParentCtrl.showMeritModal = true;">' +
           '    <i class="fa fa-plus-square"></i>' +
           '  </a>' +
           '</li>';

var directive = [function() {
  return {
    restrict: 'E',
    scope: true,
    replace: true,
    template: html
  };
}];

angular.module('ept').directive('sendMeritButton', directive);
