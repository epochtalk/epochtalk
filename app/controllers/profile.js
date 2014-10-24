module.exports = ['user', 'User', 'Auth', '$location',
  function(user, User, Auth, $location) {
    var ctrl = this;
    this.user = {};
    user.$promise.then(function(user) {
      ctrl.user = user;
      ctrl.displayUsername = angular.copy(user.username);
      ctrl.displayEmail = angular.copy(user.email);
    });
    this.editMode = false;
    this.error = {};

    this.saveProfile = function() {
      User.update(this.user).$promise
      .then(function(data) {
        ctrl.user = data;
        ctrl.editMode = false;
        ctrl.error = {}; // reset error

        // redirect page if username changed
        if (ctrl.displayUsername !== ctrl.user.username) {
          $location.path('/profiles/' + ctrl.user.username);
          Auth.setUser(ctrl.user.username);
        }
      })
      .catch(function(err) {
        ctrl.error.status = true;
        ctrl.error.message = err.data.error + ": " + err.data.message;
      });
    };
  }
];

