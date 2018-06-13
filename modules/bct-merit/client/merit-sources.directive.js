var directive = ['Merit', 'Session', 'Alert', 'AdminUsers', function(Merit, Session, Alert, AdminUsers) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./merit-sources.html'),
    controllerAs: 'vmMS',
    controller: ['$scope', function($scope) {
      var ctrl = this;
      this.sources = [];

      // Permissions Handling
      this.hasPermission = function() {
        return Session.hasPermission('merit.insertSource.allow') &&
          Session.hasPermission('merit.getLatestSourceRecords.allow');
      };

      // Query initial list of sources
      Merit.getLatestSourceRecords().$promise
      .then(function(sources) { ctrl.sources = sources; });


      this.newSource = {};
      this.saveSourceBtnLabel = 'Save Source';

      this.insertSource = function() {
        ctrl.submitted = true;
        ctrl.saveSourceBtnLabel = 'Loading...';
        return AdminUsers.get({ username: ctrl.newSource.username }).$promise
        .then(function(user) {
          ctrl.newSource.user_id = user.id;
          return Merit.insertSource(ctrl.newSource).$promise
        })
        .then(function() {
          Alert.success('Sucessfully added merit source record for ' + ctrl.newSource.username);
          ctrl.newSource = {};
          ctrl.showModal = false;
          return Merit.getLatestSourceRecords().$promise
        })
        .then(function(sources) {
          ctrl.sources = sources;
          return;
         })
        .catch(function(err) {
          var errMsg = 'There was an error modifying the merit sources';
          if (err && err.data && err.data.statusCode === 403) {
            errMsg = 'You do not have permissions to modify merit sources';
          }
          else if (err && err.data && err.data.statusCode === 404) {
            errMsg = 'User does not exist, cannot add as merit source';
          }
          Alert.error(errMsg);
        })
        .finally(function() {
          ctrl.saveSourceBtnLabel = 'Save Source';
          ctrl.submitted = false;
        });
      };

    }]
  };
}];

angular.module('ept').directive('meritSources', directive);
