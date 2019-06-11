module.exports = ['User', 'Alert',
function(User, Alert) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { show: '=' },
    template: require('./invite.html'),
    controllerAs: 'vm',
    controller: [function() {
      var ctrl = this;
      this.email = '';
      this.errorMessage = '';

      this.invite = function() {
        ctrl.errorMessage = '';
        User.invite({ email: ctrl.email }).$promise
        .then(function() {
          ctrl.show = false;
          ctrl.email = '';
          Alert.success('Invitation Sent');
         })
        .catch(function(err) {
          if (err.status === 400 || err.status === 422) { ctrl.errorMessage = err.data.message; }
          else { ctrl.errorMessage = 'Failed to invite user'; }
        });
      };
    }]
  };
}];
