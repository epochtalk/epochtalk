module.exports = ['user', 'User',
  function(user, User) {
    var ctrl = this;
    this.user = user;
    this.editMode = false;
    this.error = {};

    this.startEditMode = function() {
      this.editMode = true;
    };

    this.cancelEditMode = function() {
      this.editMode = false;
    };

    this.saveProfile = function() {
      User.update(this.user).$promise
      .then(function(data) {
        ctrl.user = data;
        ctrl.editMode = false;
        ctrl.error = {}; // reset error
      })
      .catch(function(err) {
        ctrl.error.status = true;
        ctrl.error.message = err.data.error + ": " + err.data.message;
      });
    };
  }
];

