module.exports = ['user', 'User', 'Auth', '$location', '$timeout', '$filter', '$window',
  function(user, User, Auth, $location, $timeout, $filter, $window) {
    var ctrl = this;
    this.user = {};

    // Possibly a better solution than this, ui-router causes
    // issues with scrolling to top on route change.
    $window.scrollTo(0, 0);

    // Helper methods
    var calcAge = function(dob) {
      if (!dob) { return '';}
      dob = new Date(dob);
      var ageDiff = Date.now() - dob.getTime();
      var ageDate = new Date(ageDiff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    this.user = user;
    this.displayUsername = angular.copy(user.username);
    this.displayEmail = angular.copy(user.email);
    this.user.dob = $filter('date')(this.user.dob, 'longDate');
    this.userAge = calcAge(this.user.dob);
    this.user.post_count = this.user.post_count || 0;
    this.user.avatar = this.user.avatar || 'http://placehold.it/400/cccccc&text=Avatar';

    // This isn't the profile users true local time, just a placeholder
    this.userLocalTime = $filter('date')(Date.now(), 'h:mm a (Z)');

    // Show success message if user changed their username
    this.pageStatus = {};
    if ($location.search().success) {
      $location.search('success', undefined);
      this.pageStatus.status = true;
      this.pageStatus.message = 'Sucessfully saved profile';
      this.pageStatus.type = 'success';
    }

    // Edit Profile Fields
    this.editMode = false;
    this.saveProfile = function() {
      User.update(this.user).$promise
      .then(function(data) {
        ctrl.user = data;
        ctrl.editMode = false;
        ctrl.pageStatus = {}; // reset error

        // Reformat DOB and calculate age on save
        ctrl.user.dob = $filter('date')(ctrl.user.dob, 'longDate');
        ctrl.userAge = calcAge(ctrl.user.dob);

        // redirect page if username changed
        if (ctrl.displayUsername !== ctrl.user.username) {
          $location.search('success', true);
          $location.path('/profiles/' + ctrl.user.username);
          Auth.setUsername(ctrl.user.username);
        }
        ctrl.pageStatus.status = true;
        ctrl.pageStatus.message = 'Sucessfully saved profile';
        ctrl.pageStatus.type = 'success';
        $window.scrollTo(0, 0);
      })
      .catch(function(err) {
        ctrl.pageStatus.status = true;
        ctrl.pageStatus.type = 'alert';
        ctrl.pageStatus.message = err.data.error + ': ' + err.data.message;
        $window.scrollTo(0, 0);
      });
    };

    this.editAvatar = false;
    this.saveAvatar = function() {
      User.update(this.user).$promise
      .then(function(data) {
        ctrl.user = data;
        ctrl.editAvatar = false;
        ctrl.pageStatus = {}; // reset error
        ctrl.pageStatus.status = true;
        ctrl.pageStatus.message = 'Sucessfully saved profile';
        ctrl.pageStatus.type = 'success';
        $window.scrollTo(0, 0);
      })
      .catch(function(err) {
        ctrl.pageStatus.status = true;
        ctrl.pageStatus.type = 'alert';
        ctrl.pageStatus.message = err.data.error + ': ' + err.data.message;
        $window.scrollTo(0, 0);
      });
    };

    // Change Password Modal
    this.passData = {};
    this.changePassStatus = {};
    this.showChangePass = false;
    this.changePassModalVisible = false;

    this.openChangePassModal = function() {
      ctrl.showChangePass = true;
      ctrl.changePassModalVisible = true;
    };

    this.closeChangePassModal = function() {
      ctrl.showChangePass = false;
    };

    this.clearChangePassFields = function() {
      $timeout(function() {
        ctrl.changePassModalVisible = false;
        ctrl.passData.oldPass = '';
        ctrl.passData.password = '';
        ctrl.passData.confirmation = '';
        ctrl.changePassStatus = {};
      }, 500);
    };

    this.changePassword = function() {
      var changePassUser = {
        id: ctrl.user.id,
        old_password: ctrl.passData.oldPass,
        password: ctrl.passData.password,
        confirmation: ctrl.passData.confirmation,
      };
      User.update(changePassUser).$promise
      .then(function() {
        ctrl.passData = {};
        ctrl.pageStatus.status = true;
        ctrl.pageStatus.message = 'Sucessfully changed account password';
        ctrl.pageStatus.type = 'success';
        ctrl.closeChangePassModal();
      })
      .catch(function(err) {
        ctrl.changePassStatus.status = true;
        ctrl.changePassStatus.message = err.data.message;
        ctrl.changePassStatus.type = 'alert';
      });
    };

    var data = {
      labels: ["August", "September", "October", "November", "December", "January", "February"],
      datasets: [
        {
          label: "My First dataset",
          fillColor: "rgba(220,220,220,0.2)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: [65, 59, 80, 81, 56, 55, 40]
        }
      ]
    };
    Chart.defaults.global.responsive = true;
    var ctx = document.getElementById("myChart").getContext("2d");
    var myNewChart = new Chart(ctx).Line(data);
  }
];
