module.exports = ['$location', 'Auth',
  function($location, Auth) {
    var ctrl = this;
    this.user = {};
    this.error = {};

    this.register = function() {
      ctrl.error = {};

      Auth.register(this.user,
        function() { $location.path('/'); },
        function(err) {
          ctrl.error.status = true;
          ctrl.error.message = err.data.message;
        }
      );
    };
  }
];
