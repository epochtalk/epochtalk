module.exports = ['users', function(users) {
  var ctrl = this;

  users.$promise
  .then(function(allUsers) {
    console.log(allUsers);
    ctrl.users = allUsers;
  });
}];
