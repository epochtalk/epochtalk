module.exports = ['user', 'User', 'Session', '$location', '$timeout', '$filter', '$anchorScroll',
  function(user, User, Session, $location, $timeout, $filter, $anchorScroll) {
    var ctrl = this;
    $timeout($anchorScroll);
    this.errors = {};
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
    this.editProfile = false;
    this.clearPasswordFields = function() {
      $timeout(function() { delete ctrl.errors.profile; }, 500);
    };

    this.saveProfile = function() {
      delete ctrl.errors.profile;
      var changeProfileUser = {
        id: ctrl.user.id,
        username: ctrl.user.username,
        name: ctrl.user.name,
        email: ctrl.user.email,
        website: ctrl.user.website,
        btcAddress: ctrl.user.btcAddress,
        gender: ctrl.user.gender,
        dob: ctrl.user.dob,
        location: ctrl.user.location,
        language: ctrl.user.language
      };

      User.update(changeProfileUser).$promise
      .then(function(data) {
        ctrl.user = data;

        // Reformat DOB and calculate age on save
        ctrl.user.dob = $filter('date')(ctrl.user.dob, 'longDate');
        ctrl.userAge = calcAge(ctrl.user.dob);

        // redirect page if username changed
        if (ctrl.displayUsername !== ctrl.user.username) {
          $location.search('success', true);
          $location.path('/profiles/' + ctrl.user.username);
          Session.setUsername(ctrl.user.username);
        }

        ctrl.editProfile = false;
        updatePageStatus('success', 'Successfully saved profile');
        $timeout($anchorScroll);
      })
      .catch(function(err) {
        ctrl.errors.profile = {};
        ctrl.errors.profile.type = 'alert';
        ctrl.errors.profile.message = 'Profile could not be updated';
      });
    };

    // Edit Avatar
    this.editAvatar = false;
    this.clearPasswordFields = function() {
      $timeout(function() { delete ctrl.errors.avatar; }, 500);
    };

    this.saveAvatar = function() {
      delete ctrl.errors.avatar;
      var changeAvatarUser = {
        id: ctrl.user.id,
        avatar: ctrl.user.avatar,
      };

      User.update(changeAvatarUser).$promise
      .then(function(data) {
        ctrl.user = data;
        ctrl.displayAvatar = angular.copy(data.avatar || 'http://placehold.it/400/cccccc/&text=Avatar');
        Session.setAvatar(ctrl.displayAvatar);
        ctrl.editAvatar = false;
        updatePageStatus('success', 'Successfully updated avatar');
        $timeout($anchorScroll);
      })
      .catch(function(err) {
        ctrl.errors.avatar = {};
        ctrl.errors.avatar.type = 'alert';
        ctrl.errors.avatar.message = 'Avatar could not be updated';
      });
    };

    // Edit Signature
    this.editSignature = false;
    this.clearSignatureFields = function() {
      $timeout(function() { delete ctrl.errors.signature; }, 500);
    };

    this.saveSignature = function() {
      delete ctrl.errors.signature;
      var changeSigUser = {
        id: ctrl.user.id,
        raw_signature: ctrl.user.raw_signature
      };

      User.update(changeSigUser).$promise
      .then(function(data) {
        ctrl.user = data;
        ctrl.editSignature = false;
        updatePageStatus('success', 'Successfully updated signature');
        $timeout($anchorScroll);
      })
      .catch(function(err) {
        ctrl.errors.signature = {};
        ctrl.errors.signature.type = 'alert';
        ctrl.errors.signature.message = 'Signature could not be updated';
      });
    };

    // Edit Password
    this.editPassword = false;
    this.passData = { id: ctrl.user.id };
    this.clearPasswordFields = function() {
      $timeout(function() {
        ctrl.passData = { id: ctrl.user.id };
        delete ctrl.errors.password;
      }, 500);
    };

    this.savePassword = function() {
      delete ctrl.errors.password;

      User.update(ctrl.passData).$promise
      .then(function() {
        ctrl.clearPasswordFields();
        ctrl.editPassword = false;
        updatePageStatus('success', 'Sucessfully changed account password');
        $timeout($anchorScroll);
      })
      .catch(function(err) {
        console.log(err);
        ctrl.errors.password = {};
        ctrl.errors.password.type = 'alert';
        ctrl.errors.password.message = 'Error updating password';
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
