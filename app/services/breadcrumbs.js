'use strict';
/* jslint node: true */

module.exports = ['$rootScope', 'Breadcrumbs', function ($rootScope, Breadcrumbs) {
  // Static Pages
  var home =            { url: '/',                 label: 'Home' };
  var register =        { url: '/register',         label: 'Registration' };
  var profile =         { url: '/profile',          label: 'Profile' };
  var admin =           { url: '/admin',            label: 'Admin' };
  var categories =      { url: '/admin/categories', label: 'Category Editor' };

  // Static Page Crumbs
  var staticCrumbs = {
    home: [ home ],
    register: [ home, register ],
    profile: [ home, profile ],
    admin: [ home, admin ],
    categories: [home, admin, categories]
  };

  var breadcrumbs;

  return {
    update: function(id, type) {
      breadcrumbs = [];

      if (type) { // If type is provided dynamically build breadcrumbs
        Breadcrumbs.getBreadcrumbs({ id: id, type: type}, function(partialCrumbs) {
          breadcrumbs = breadcrumbs.concat(staticCrumbs.home, partialCrumbs);
        });
      }
      else { // If type is not provided set static breadcrumbs
        breadcrumbs = breadcrumbs.concat(staticCrumbs[id]);
      }
    },
    crumbs: function() { return breadcrumbs; }
  };
}];