'use strict';
/* jslint node: true */
var _ = require('lodash');

module.exports = ['$routeParams', '$location', 'Breadcrumbs',
function ($routeParams, $location, Breadcrumbs) {
  var breadcrumbs; // stores array of breadcrumb objects

  // Static Page Routes
  var routes = {
    home:           '/',
    boards:         '/boards',
    register:       '/register',
    profile:        '/profile',
    admin:          '/admin',
    categories:     '/admin/categories'
  };

  // Static Page Breadcrumb Objects
  var home =        { url: routes.home,         label: 'Home' };
  var register =    { url: routes.register,     label: 'Registration' };
  var profile =     { url: routes.profile,      label: 'Profile' };
  var admin =       { url: routes.admin,        label: 'Admin' };
  var categories =  { url: routes.categories,   label: 'Category Editor' };

  // Static Page Breadcrumb Array
  var staticCrumbs = {};
  staticCrumbs[routes.home] =         [ home ];
  staticCrumbs[routes.boards] =       [ home ];
  staticCrumbs[routes.register] =     [ home, register ];
  staticCrumbs[routes.profile] =      [ home, profile ];
  staticCrumbs[routes.admin] =        [ home, admin ];
  staticCrumbs[routes.categories] =   [ home, admin, categories];

  return {
    update: function() {
      breadcrumbs = [];
      var path = $location.path();
      var routeParams = $routeParams;
      // Maps routeParams key to breadcrumb type
      var keyToType = {
        boardId:  'board',
        threadId: 'thread',
        postId:   'post'
      };
      var routeParamKeys = Object.keys(routeParams);
      var keys = Object.keys(keyToType);
      var matches = _.intersection(routeParamKeys, keys);
      // routeParams isn't empty, route is dynamic
      if (!_.isEmpty(matches)) {
        var idKey = routeParamKeys.reverse()[0];
        Breadcrumbs.getBreadcrumbs({ id: routeParams[idKey], type: keyToType[idKey] },
        function(partialCrumbs) {
          breadcrumbs = breadcrumbs.concat(staticCrumbs[routes.home], partialCrumbs);
        });
      }
      else { // routeParams is empty, route is static
        breadcrumbs = breadcrumbs.concat(staticCrumbs[path]);
      }
    },
    crumbs: function() { return breadcrumbs; }
  };
}];