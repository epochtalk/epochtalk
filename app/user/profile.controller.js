module.exports = ['user', 'User', 'Auth', '$location', '$timeout', '$filter', '$anchorScroll',
  function(user, User, Auth, $location, $timeout, $filter, $anchorScroll) {
    var ctrl = this;
    $timeout($anchorScroll);
    this.user = user;
    this.displayUsername = angular.copy(user.username);
    this.displayEmail = angular.copy(user.email);
    this.user.dob = $filter('date')(this.user.dob, 'longDate');
    this.user.post_count = this.user.post_count || 0;
    this.displayAvatar = angular.copy(this.user.avatar || 'http://placehold.it/400/cccccc/&text=Avatar');
    // This isn't the profile users true local time, just a placeholder
    this.userLocalTime = $filter('date')(Date.now(), 'h:mm a (Z)');

    var calcAge = function(dob) {
      if (!dob) { return '';}
      dob = new Date(dob);
      var ageDiff = Date.now() - dob.getTime();
      var ageDate = new Date(ageDiff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };
    this.userAge = calcAge(this.user.dob);

    // Show success message if user changed their username
    this.pageStatus = {};
    if ($location.search().success) {
      $location.search('success', undefined);
      updatePageStatus('success', 'Successfully saved profile');
    }
    function updatePageStatus(type, message) {
      ctrl.pageStatus.status = true;
      ctrl.pageStatus.type = type;
      ctrl.pageStatus.message = message;
    }

    // Edit Profile
    this.editMode = false;
    this.openChangeUserModel = function() {
      ctrl.editMode = true;
      ctrl.user.signature = ctrl.user.signature.replace(/<br \/>/gi,'\r\n');
    };

    this.closeChangeUserModel = function() {
      ctrl.user.signature = ctrl.user.signature.replace(/\r\n|\r|\n/g,'<br />');
    };

    this.saveProfile = function() {
      User.update(this.user).$promise
      .then(function(data) {
        ctrl.user = data;
        ctrl.editMode = false;

        // Reformat DOB and calculate age on save
        ctrl.user.dob = $filter('date')(ctrl.user.dob, 'longDate');
        ctrl.userAge = calcAge(ctrl.user.dob);

        // redirect page if username changed
        if (ctrl.displayUsername !== ctrl.user.username) {
          $location.search('success', true);
          $location.path('/profiles/' + ctrl.user.username);
          Auth.setUsername(ctrl.user.username);
        }

        updatePageStatus('success', 'Successfully saved profile');
        $timeout($anchorScroll);
      })
      .catch(function(err) {
        updatePageStatus('alert', err.data.error + ': ' + err.data.message);
        $timeout($anchorScroll);
      });
    };

    // Edit Avatar
    this.editAvatar = false;
    this.saveAvatar = function() {
      User.update(this.user).$promise
      .then(function(data) {
        ctrl.user = data;
        ctrl.displayAvatar = angular.copy(data.avatar || 'http://placehold.it/400/cccccc/&text=Avatar');
        ctrl.editAvatar = false;
        updatePageStatus('success', 'Successfully saved profile');
        $timeout($anchorScroll);
      })
      .catch(function(err) {
        updatePageStatus('alert', err.data.error + ': ' + err.data.message);
        $timeout($anchorScroll);
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
        ctrl.closeChangePassModal();
        ctrl.clearChangePassFields();
        updatePageStatus('success', 'Sucessfully changed account password');
      })
      .catch(function(err) {
        ctrl.changePassStatus = {
          status: true,
          type: alert,
          message: err.data.message
        };
      });
    };

    // DUMMY CHART DATA

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
