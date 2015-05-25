module.exports = ['user', 'usersPosts', 'usersPostsCount', 'limit', 'page', 'field', 'desc', 'User', 'Posts', 'Session', 'Alert', '$location', '$timeout', '$filter', '$anchorScroll', '$scope', '$rootScope',
  function(user, usersPosts, usersPostsCount, limit, page, field, desc, User, Posts, Session, Alert, $location, $timeout, $filter, $anchorScroll, $scope, $rootScope) {
    var ctrl = this;
    $timeout($anchorScroll);
    this.user = user;
    this.usersPosts = usersPosts;
    this.editable = function() { return Session.user.id === user.id; };
    this.displayUsername = angular.copy(user.username);
    this.displayEmail = angular.copy(user.email);
    this.user.dob = $filter('date')(this.user.dob, 'longDate');
    this.user.post_count = this.user.post_count || 0;
    this.displayAvatar = angular.copy(this.user.avatar || 'http://placehold.it/400/cccccc/&text=' + user.username);
    // This isn't the profile users true local time, just a placeholder
    this.userLocalTime = $filter('date')(Date.now(), 'h:mm a (Z)');

    // Pagination vars
    this.pageCount = Math.ceil(usersPostsCount / limit);
    this.queryParams = $location.search();
    this.page = page;
    this.limit = limit;
    this.field = field;
    this.desc = desc;

    this.setSortField = function(sortField) {
      // Sort Field hasn't changed just toggle desc
      var unchanged = sortField === ctrl.field;
      if (unchanged) { ctrl.desc = ctrl.desc === 'true' ? 'false' : 'true'; } // bool to str
      // Sort Field changed default to ascending order
      else { ctrl.desc = 'false'; }
      ctrl.field = sortField;
      ctrl.page = 1;
      $location.search('page', ctrl.page);
      $location.search('desc', ctrl.desc);
      $location.search('field', sortField);

      // Update queryParams (forces pagination to refresh)
      ctrl.queryParams = $location.search();
    };

    this.getSortClass = function(sortField) {
      var sortClass;
      var sortDesc;
      // if desc param is undefined default to true if sorting by created_at
      if ($location.search().desc === undefined && sortField === 'created_at') { sortDesc = true; }
      else { sortDesc = ctrl.desc === 'true'; }
      // created_at is sorted desc by default when ctrl.field is not present
      if (sortField === 'created_at' && !ctrl.field && sortDesc) { sortClass = 'fa fa-sort-desc'; }
      else if (ctrl.field === sortField && sortDesc) { sortClass = 'fa fa-sort-desc'; }
      else if (ctrl.field === sortField && !sortDesc) { sortClass = 'fa fa-sort-asc'; }
      else { sortClass = 'fa fa-sort'; }
      return sortClass;
    };

    var calcAge = function(dob) {
      if (!dob) { return '';}
      dob = new Date(dob);
      var ageDiff = Date.now() - dob.getTime();
      var ageDate = new Date(ageDiff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };
    this.userAge = calcAge(this.user.dob);

    // Show success message if user changed their username
    if ($location.search().success) {
      $location.search('success', undefined);
      Alert.success('Successfully saved profile');
    }

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
          $location.search('success', true);
          $location.path('/profiles/' + ctrl.user.username);
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
        ctrl.displayAvatar = angular.copy(data.avatar || 'http://placehold.it/400/cccccc/&text=Avatar' + ctrl.user.username);
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

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
      var params = $location.search();
      var page = Number(params.page) || 1;
      var limit = Number(params.limit) || 10;
      var descending;
      // desc when undefined defaults to true, since we are sorting created_at desc by default
      if (params.desc === undefined) { descending = true; }
      else { descending = params.desc === 'true'; }
      var pageChanged = false;
      var limitChanged = false;
      var fieldChanged = false;
      var descChanged = false;

      if (page && page !== ctrl.page) {
        pageChanged = true;
        ctrl.page = page;
      }
      if (limit && limit !== ctrl.limit) {
        limitChanged = true;
        ctrl.limit = limit;
      }
      if (field && field !== ctrl.field) {
        fieldChanged = true;
        ctrl.field = field;
      }
      if (descending !== ctrl.desc) {
        descChanged = true;
        ctrl.desc = descending.toString();
      }
      if(pageChanged || limitChanged || fieldChanged || descChanged) { ctrl.pullPage(); }
    });
    $scope.$on('$destroy', function() { ctrl.offLCS(); });

    this.pullPage = function() {
      var params = {
        username: user.username,
        page: ctrl.page,
        limit: ctrl.limit
      };

      if (ctrl.desc) { params.desc = ctrl.desc; }
      if (ctrl.field) { params.field = ctrl.field; }

      // update user post's page count
      Posts.pageByUserCount({ username: user.username }).$promise
      .then(function(updatedCount) {
        ctrl.pageCount = Math.ceil(updatedCount.count / limit);
      });

      // replace current user post with new user posts
      Posts.pageByUser(params).$promise
      .then(function(newPosts) {
        ctrl.usersPosts = newPosts;
        $timeout($anchorScroll);
      });
    };
  }
];
