module.exports = ['$location', 'Auth',
  function($location, Auth) {
    // Determines if the user is on an admin page
    this.isAdminPanel = function() {
      var pathArr = $location.path().split('/');
      pathArr.shift();
      return pathArr[0].toLowerCase() === 'admin';
    };

    Auth.checkAuthentication();
    // TODO: Add check to verify user is admin
    this.isAuthenticatedAdmin = Auth.isAuthenticated;
  }
];
