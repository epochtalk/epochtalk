var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');
var adapter = new FileSync('/modules/cb-altcoins/db/db.json');
var db = low(adapter);

var directive = ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./admin-projects.html'),
    controllerAs: 'vmAdminProjects',
    controller: [function() {
      var ctrl = this;
      this.project = null;

      $timeout(function() {
        // Set some defaults
        db.defaults({ projects: [], tags: [] })
          .write()

        // Add a post
        db.get('projects')
          .push({ id: 1, name: 'Example Coint', ticker: 'EXC'})
          .write()

        ctrl.project = db.get('projects')
          .find({ id: 1 })
          .value()
      });

    }]
  };
}];

angular.module('ept').directive('adminProjects', directive);


