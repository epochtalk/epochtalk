var ctrl = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', function($rootScope, $scope, $location, $timeout, $anchorScroll) {
  var ctrl = this;
  this.parent = $scope.$parent.ModerationCtrl;
  this.parent.tab = 'board-bans';


  // Call init

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {

  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {

  };
}];

module.exports = angular.module('ept.admin.moderation.boardBans.ctrl', [])
.controller('ModBoardBansCtrl', ctrl)
.name;
