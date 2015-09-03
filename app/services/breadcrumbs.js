'use strict';
/* jslint node: true */
var _ = require('lodash');

module.exports = ['$stateParams', '$location', 'Breadcrumbs',
function ($stateParams, $location, Breadcrumbs) {
  var breadcrumbsStore; // stores array of breadcrumb objects

  var pathLookup = {
    home: {
      state: '^.boards',
      label: 'Home'
    },
    profiles: {
      label: 'Profiles'
    },
    reset: {
      label: 'Reset Password',
      ignoreFollowing: true
    },
    confirm: {
      label: 'Account Confirmation',
      ignoreFollowing: true
    }
  };

  return {
    update: function() {
      var breadcrumbs = [ pathLookup.home ];
      var path = $location.path();
      var routeParams = $stateParams;

      // Strip query str params since stateParams includes query and route params together
      delete routeParams.limit;
      delete routeParams.page;

      // Maps routeParams key to breadcrumb type
      var keyToType = {
        boardId:  'board',
        threadId: 'thread',
      };
      var routeParamKeys = _.without(Object.keys(routeParams), '#'); // remove anchor hash from params
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
        for (var i = 0, len = pathArr.length; i < len; i++) {
          var id = pathArr[i];
          var crumb = pathLookup[id] || { label: id };
          breadcrumbs.push(crumb);
          if (crumb.ignoreFollowing) { break; } // ignore following crumbs if ignoreFollowing is true
        }
        breadcrumbsStore = breadcrumbs;
      }
    },
    crumbs: function() { return breadcrumbsStore; }
  };
}];
