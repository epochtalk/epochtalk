var directive = ['UserTrust', function(UserTrust) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { defaultTrust: '=', callback: '=' },
    template: require('./trustList.html'),
    controllerAs: 'vm',
    controller: [function() {
      var ctrl = this;
      this.userToTrust = {};
      this.trustList = [];
      this.untrustList = [];
      this.maxDepth = null;

      var trustListPromise = this.defaultTrust ? UserTrust.getDefaultTrustList() : UserTrust.getTrustList();

      trustListPromise.$promise
      .then(function(trustData) {
        ctrl.trustList = trustData.trustList;
        ctrl.untrustList = trustData.untrustList;
        ctrl.maxDepth = trustData.maxDepth;
      });

      this.addToTrustList = function() {
        if (!ctrl.userToTrust.user_id_trusted || !ctrl.userToTrust.username_trusted) { return; }
        ctrl.untrustList = ctrl.untrustList.filter(function(u) {
          return u.user_id_trusted !== ctrl.userToTrust.user_id_trusted;
        });
        ctrl.userToTrust.type = 0;
        ctrl.trustList.push(ctrl.userToTrust);
        ctrl.userToTrust = {};
      };

      this.addToUntrustList = function() {
        if (!ctrl.userToTrust.user_id_trusted || !ctrl.userToTrust.username_trusted) { return; }
        ctrl.trustList = ctrl.trustList.filter(function(u) {
          return u.user_id_trusted !== ctrl.userToTrust.user_id_trusted;
        });
        ctrl.userToTrust.type = 1;
        ctrl.untrustList.push(ctrl.userToTrust);
        ctrl.userToTrust = {};
      };

      this.removeSelectedTrust = function() {
        ctrl.trustList = ctrl.trustList.filter(function(user) {
          return ctrl.selectedTrustedUsers.filter(function(u) {
            return u.user_id_trusted === user.user_id_trusted;
          }).length === 0;
        });
      };

      this.removeSelectedUntrust = function() {
        ctrl.untrustList = ctrl.untrustList.filter(function(user) {
          return ctrl.selectedUntrustedUsers.filter(function(u) {
            return u.user_id_trusted === user.user_id_trusted;
          }).length === 0;
        });
      };

      this.trustedUserExists = function() {
        return !!ctrl.trustList.find(function(u) {
          return u.user_id_trusted === ctrl.userToTrust.user_id_trusted;
        });
      };

      this.untrustedUserExists = function() {
        return !!ctrl.untrustList.find(function(u) {
          return u.user_id_trusted === ctrl.userToTrust.user_id_trusted;
        });
      };

      this.editTrustList = function() {
        var params = {
          max_depth: ctrl.maxDepth >= 0 && ctrl.maxDepth <= 4 ? ctrl.maxDepth : 2,
          list: ctrl.trustList.concat(ctrl.untrustList)
        };
        var editTrustListPromise = this.defaultTrust ? UserTrust.editDefaultTrustList(params) : UserTrust.editTrustList(params);
        editTrustListPromise.$promise
        .then(function(updatedLists) {
          ctrl.trustList = updatedLists.trustList;
          ctrl.untrustList = updatedLists.untrustList;
          ctrl.maxDepth = updatedLists.maxDepth;
          if (ctrl.callback) { return ctrl.callback(); }
         });
      };


    }]
  };
}];

require('../../components/autocomplete_user_id/autocomplete-user-id.directive');

angular.module('ept').directive('trustList', directive);
