var ctrl = ['$timeout', 'Session', 'Alert', 'UserTrust', 'user', 'feedback', function($timeout, Session, Alert, UserTrust, user, feedback) {
    var ctrl = this;
    this.user = user;
    this.userFeedback = feedback;
    this.loggedIn = Session.isAuthenticated;
    this.hideAddFeedback = (Session.user.id === user.id) || !Session.user.permissions.userTrust || (Session.user.permissions.userTrust && !Session.user.permissions.userTrust.addTrustFeedback);

    this.feedback = {
      user_id: user.id,
      risked_btc: 0.0000,
      scammer: undefined,
      reference: undefined,
      comments: undefined
    };

    this.urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

    this.urlValid = function() {
      return !ctrl.feedback.reference || (ctrl.feedback.reference &&
        ctrl.urlRegex.test(ctrl.feedback.reference));
    };

    this.showFeedbackModal = false;
    this.feedbackSubmitted = false;
    this.submitFeedbackBtnLabel = 'Leave Feedback';

    this.addTrustFeedback = function() {
      ctrl.feedbackSubmitted = true;
      ctrl.submitFeedbackBtnLabel = 'Loading...';
      if (ctrl.feedback.scammer === -1) { ctrl.feedback.scammer = null; }
      else { ctrl.feedback.scammer = !!ctrl.feedback.scammer; }
      ctrl.feedback.reference = ctrl.feedback.reference || undefined;
      UserTrust.addTrustFeedback(ctrl.feedback).$promise
      .then(function() {
        Alert.success('Successfully left feedback for user ' + user.username);
        return UserTrust.getTrustFeedback({ username: user.username }).$promise
        .then(function(updatedFeedback) {
          ctrl.userFeedback = updatedFeedback;
        });
      })
      .catch(function(err) {
        var message = err.message || 'There was an error leaving feedback for user ' + user.username;
        Alert.error(message);
      })
      .finally(function() {
        ctrl.feedbackSubmitted = false;
        ctrl.submitFeedbackBtnLabel = 'Leave Feedback';
        ctrl.closeFeedback();
      });
    };

    this.closeFeedback = function() {
      ctrl.feedback.risked_btc = 0.0000;
      ctrl.feedback.scammer = undefined;
      ctrl.feedback.reference = undefined;
      ctrl.feedback.comments = undefined;

      $timeout(function() {
        ctrl.showFeedbackModal = false;
      });
    };

  }
];

module.exports = angular.module('bct.trust.ctrl', [])
.controller('TrustCtrl', ctrl)
.name;
