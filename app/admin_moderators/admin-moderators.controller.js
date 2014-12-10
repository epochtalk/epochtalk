module.exports = ['users', function(users) {
  var ctrl = this;

  users.$promise
  .then(function(allUsers) {
    ctrl.users = allUsers;
  });
}];
