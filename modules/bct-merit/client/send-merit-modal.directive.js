var directive = ['Merit', 'Alert', 'Session', function(Merit, Alert, Session) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { post: '=', allPosts: '=', sendableMerit: '=', showMeritModal: '=' },
    template: require('./send-merit-modal.html'),
    controllerAs: 'vmSMM',
    controller: ['$scope', function($scope) {
      var ctrl = this;
      this.authUser = Session.user;

      this.meritAmount = 1;
      this.sendMeritBtnLabel = 'Send Merit';

      this.sendMerit = function() {
        ctrl.sendMeritBtnLabel = 'Loading...';
        ctrl.sendMeritSubmitted = true;
        return Merit.send({ to_user_id: ctrl.post.user.id, post_id: ctrl.post.id, amount: ctrl.meritAmount }).$promise
        // Update relevant merit values so UI is up to date.
        .then(function(results) {
          // update the posts merit array, updates merited by UI
          var found = false;
          for (var i = 0; i < ctrl.post.merits.length; i++) {
            var merit = ctrl.post.merits[i];
            if (merit.username === ctrl.authUser.username) {
              merit.amount = Number(merit.amount) + Number(ctrl.meritAmount);
              found = true;
              break;
            }
          }
          if (!found) {
            ctrl.post.merits.push({ username: ctrl.authUser.username, amount: ctrl.meritAmount });
          }

          // update the user's personal merit in all visible posts in the thread, updates post authors merit in the UI
          ctrl.allPosts.forEach(function(post) {
            if (post.user.id === ctrl.post.user.id) {
              post.user.merit = Number(post.user.merit) + Number(ctrl.meritAmount);
            }
          });

          // Update sendable merit values
          ctrl.sendableMerit.sendable_user_merit = results.sendable_user_merit;
          ctrl.sendableMerit.sendable_source_merit = results.sendable_source_merit;

          Alert.success('Sucessfully sent ' + ctrl.meritAmount + ' merit to ' + ctrl.post.user.username);
        })
        .catch(function(e){
          var errMsg = 'There was an error meriting the post.';
          if (e.data && e.data.message) { errMsg = e.data.message; }
          Alert.error(errMsg);
        })
        .finally(function() {
          ctrl.sendMeritBtnLabel = 'Send Merit';
          ctrl.sendMeritSubmitted = false;
          ctrl.showMeritModal = false;
          ctrl.meritAmount = 1;
        });
      };
    }]
  };
}];

angular.module('ept').directive('sendMeritModal', directive);
