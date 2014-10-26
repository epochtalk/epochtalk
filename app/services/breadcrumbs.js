'use strict';
/* jslint node: true */
var _ = require('lodash');

module.exports = ['$routeParams', '$location', 'Breadcrumbs',
function ($routeParams, $location, Breadcrumbs) {
  var breadcrumbsStore; // stores array of breadcrumb objects

  var pathLookup = {
    home:       { url: '/boards',             label: 'Home' },
    register:   { url: '/register',           label: 'Registration' },
    profiles:   {                             label: 'Profiles' },
    admin:      { url: '/admin',              label: 'Administration' },
    categories: { url: '/admin/categories',   label: 'Category Editor' }
  };

  return {
    update: function() {
      var breadcrumbs = [ pathLookup.home ];
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
      // matches, route is dynamic
      if (!_.isEmpty(matches)) {
        var idKey = routeParamKeys.reverse()[0];
        Breadcrumbs.getBreadcrumbs({ id: routeParams[idKey], type: keyToType[idKey] },
        function(partialCrumbs) {
          breadcrumbs = breadcrumbs.concat(partialCrumbs);
          breadcrumbsStore = breadcrumbs;
        });
      }
      else { // routeParams is empty, route is static
        var pathArr = path.split('/');
        pathArr.shift(); // Shifting array by one to eliminate empty index
        pathArr.forEach(function(id) {
          var crumb = pathLookup[id] || { label: id };
          breadcrumbs.push(crumb);
        });
        breadcrumbsStore = breadcrumbs;
      }
    },
    crumbs: function() { return breadcrumbsStore; }
  };
}];