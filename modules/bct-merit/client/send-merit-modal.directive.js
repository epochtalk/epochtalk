var html = '<modal show="PostsParentCtrl.showMeritModal">' +
           '  <button ng-click="vmSMM.sendMerit()">{{vmSMM.post.id}}</button>' +
           '</modal>';

var directive = ['Merit', 'Alert', function(Merit, Alert) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { post: '=' },
    template: html,
    controllerAs: 'vmSMM',
    controller: ['$scope', function($scope) {
      var ctrl = this;
      this.sendMerit = function() {
        return Merit.send({ to_user_id: ctrl.post.user.id, post_id: ctrl.post.id, amount: 1 }).$promise
        .then(function(result) {
          Alert.success(result);
        })
        .catch(function(e){
          console.log(e);
          Alert.error(e);
        });
      };
    }]
  };
}];


angular.module('ept').directive('sendMeritModal', directive);
