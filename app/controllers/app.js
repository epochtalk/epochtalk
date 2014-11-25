module.exports = ['$location',
  function($location) {
    // Determines if the user is on an admin page
    this.isAdminPanel = function() {
      var pathArr = $location.path().split('/');
      pathArr.shift();
      return pathArr[0].toLowerCase() === 'admin';
    };
  }
];
