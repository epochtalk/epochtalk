var ctrl = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'Alert', 'Session', 'User', 'pageData', function($rootScope, $scope, $location, $timeout, $anchorScroll, Alert, Session, User, pageData) {
  var ctrl = this;
  this.parent = $scope.$parent.AdminManagementCtrl;
  this.parent.tab = 'invitations';
  this.invitations = pageData.invitations;
  this.page = pageData.page;
  this.limit = pageData.limit;
  this.prev = pageData.page - 1;
  this.next = 0;
  if (pageData.has_more) { ctrl.next = pageData.page + 1; }

  $timeout($anchorScroll);

  // Permissions

  this.canInvite = function() {
    if (Session.isAuthenticated() && Session.hasPermission('users.invite.allow')) { return true; }
    else { return false; }
  };

  this.canResend = function() {
    if (Session.isAuthenticated() && Session.hasPermission('users.resend.allow')) { return true; }
    else { return false; }
  };

  this.canRemove = function() {
    var authed = Session.isAuthenticated();
    var hasPerm = Session.hasPermission('users.removeInvite.allow');
    if (authed && hasPerm) { return true; }
    else { return false; }
  };

  // Actions

  this.resendEmail = '';
  this.showResendModal = false;
  this.openResendModal = function(invite) {
    ctrl.resendEmail = invite.email;
    ctrl.showResendModal = true;
  };

  this.resend = function() {
    User.resendInvite({email: ctrl.resendEmail}).$promise
    .then(function() { Alert.success('Resent Invitation to ' + ctrl.resendEmail); })
    .then(function() { ctrl.showResendModal = false; })
    .catch(function() { Alert.error('Failed to Resend Invitation'); });
  };

  this.removeEmail = '';
  this.showRemoveModal = false;
  this.openRemoveModal = function(invite) {
    ctrl.removeEmail = invite.email;
    ctrl.showRemoveModal = true;
  };

  this.remove = function() {
    User.removeInvite({ email: ctrl.removeEmail }).$promise
    .then(function() { Alert.success('Invitation to ' + ctrl.removeEmail + ' deleted'); })
    .then(function() { ctrl.showRemoveModal = false; })
    .then(function() { ctrl.pullPage(); })
    .catch(function() { Alert.error('Failed to Remove Inivtation'); });
  };

  this.inviteEmail = '';
  this.invite = function() {
    User.invite({ email: ctrl.inviteEmail }).$promise
    .then(function() { Alert.success('Invitation send to ' + ctrl.inviteEmail ); })
    .then(function() { ctrl.inviteEmail = ''; })
    .then(function() { ctrl.pullPage(); })
    .catch(function(err) {
      if (err.status === 422) { Alert.error(err.data.message); }
      else { Alert.error('Failed to Invite User'); }
    });
  };

  // Paging

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 25;

    var pageChanged = false;
    var limitChanged = false;

    if ((page === undefined || page) && page !== ctrl.page) {
      pageChanged = true;
      ctrl.page = page;
    }
    if ((limit === undefined || limit) && limit !== ctrl.limit) {
      limitChanged = true;
      ctrl.limit = limit;
    }
    if (pageChanged || limitChanged) { ctrl.pullPage(); }
  });

  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = { page: ctrl.page, limit: ctrl.limit };

    // replace current users with new users
    User.inviteList(query).$promise
    .then(function(res) {
      ctrl.invitations = res.invitations;
      ctrl.prev = res.page - 1;
      if (res.has_more) { ctrl.next = res.page + 1; }
      else { ctrl.next = 0; }
      $timeout($anchorScroll);
    });
  };
}];

module.exports = angular.module('ept.admin.management.invitations.ctrl', [])
.controller('InvitationsCtrl', ctrl);
