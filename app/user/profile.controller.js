module.exports = ['user', 'User', 'Session', 'Alert', '$timeout', '$filter', '$state', '$location',
  function(user, User, Session, Alert, $timeout, $filter, $state, $location) {
    var ctrl = this;
    this.user = user;
    this.editable = function() { return Session.user.id === user.id; };
    this.displayUsername = angular.copy(user.username);
    this.displayEmail = angular.copy(user.email);
    this.user.dob = $filter('date')(this.user.dob, 'longDate');
    this.user.post_count = this.user.post_count || 0;
    this.displayAvatar = angular.copy(this.user.avatar || 'http://fakeimg.pl/400x400/ccc/444/?text=' + user.username);
    // This isn't the profile users true local time, just a placeholder
    this.userLocalTime = $filter('date')(Date.now(), 'h:mm a (Z)');
    this.displayPostsUrl = false;

    var calcAge = function(dob) {
      if (!dob) { return '';}
      dob = new Date(dob);
      var ageDiff = Date.now() - dob.getTime();
      var ageDate = new Date(ageDiff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };
    this.userAge = calcAge(this.user.dob);

    // Edit Profile
    this.editProfile = false;
    this.saveProfile = function() {
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

        // redirect page if username changed
        if (ctrl.displayUsername !== ctrl.user.username) {
          Session.setUsername(ctrl.user.username);
        }
        else {
          // Reformat DOB and calculate age on save
          ctrl.editProfile = false;
          ctrl.user.dob = $filter('date')(ctrl.user.dob, 'longDate');
          ctrl.userAge = calcAge(ctrl.user.dob);
          Alert.success('Successfully saved profile');
        }
      })
      .catch(function() { Alert.error('Profile could not be updated'); });
    };

    // Edit Avatar
    this.editAvatar = false;
    this.saveAvatar = function() {
      var changeAvatarUser = {
        id: ctrl.user.id,
        avatar: ctrl.user.avatar,
      };

      User.update(changeAvatarUser).$promise
      .then(function(data) {
        ctrl.user = data;
        ctrl.displayAvatar = angular.copy(data.avatar || 'http://fakeimg.pl/400x400/ccc/444/?text=' + ctrl.user.username);
        Session.setAvatar(ctrl.displayAvatar);
        ctrl.editAvatar = false;
        Alert.success('Successfully updated avatar');
      })
      .catch(function() { Alert.error('Avatar could not be updated'); });
    };

    // Edit Signature
    this.editSignature = false;
    this.saveSignature = function() {
      var changeSigUser = {
        id: ctrl.user.id,
        raw_signature: ctrl.user.raw_signature
      };

      User.update(changeSigUser).$promise
      .then(function(data) {
        ctrl.user = data;
        ctrl.editSignature = false;
        Alert.success('Successfully updated signature');
      })
      .catch(function() { Alert.error('Signature could not be updated'); });
    };

    // Edit Password
    this.editPassword = false;
    this.passData = { id: ctrl.user.id };
    this.clearPasswordFields = function() {
      $timeout(function() { ctrl.passData = { id: ctrl.user.id }; }, 500);
    };

    this.savePassword = function() {
      User.update(ctrl.passData).$promise
      .then(function() {
        ctrl.clearPasswordFields();
        ctrl.editPassword = false;
        Alert.success('Sucessfully changed account password');
      })
      .catch(function() { Alert.error('Error updating password'); });
    };

    // DUMMY CHART DATA

    var data = {
      labels: ['August', 'September', 'October', 'November', 'December', 'January', 'February'],
      datasets: [
        {
          label: 'My First dataset',
          fillColor: 'rgba(220,220,220,0.2)',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: [65, 59, 80, 81, 56, 55, 40]
        }
      ]
    };
    Chart.defaults.global.responsive = true;
    var ctx = document.getElementById('myChart').getContext('2d');
    var myNewChart = new Chart(ctx).Line(data);

    // Only show user's posts if viewing via the profile state
    if ($state.current.name === 'profile') {
      // Load posts state with proper state params
      var params = $location.search();
      $state.go('profile.posts', params, { location: false, reload: 'profile.posts' });
    }
    else {
      this.displayPostsUrl = true;
    }
  }
];
