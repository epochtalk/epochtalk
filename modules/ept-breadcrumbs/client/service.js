var without = require('lodash/without');
var intersection = require('lodash/intersection');
var isEmpty = require('lodash/isEmpty');

var service = ['$state', '$stateParams', '$location', 'Breadcrumbs',
function ($state, $stateParams, $location, Breadcrumbs) {
  var breadcrumbsStore; // stores array of breadcrumb objects

  var pathLookup = {
    home: {
      state: '^.home',
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
    updateLabelInPlace: function(newLabel) {
      breadcrumbsStore[breadcrumbsStore.length - 1].label = newLabel;
    },
    update: function() {
      var breadcrumbs = [ pathLookup.home ];
      var path = $location.path();
      var routeParams = $stateParams;

      // Handle 403 breadcrumb
      if ($state.current.name === '403' || $state.current.name ===  '503') {
        breadcrumbsStore = breadcrumbs;
        return;
      }

      // Strip query str params since stateParams includes query and route params together
      delete routeParams.limit;
      delete routeParams.page;
      delete routeParams.start;
      delete routeParams.purged;

      // Maps routeParams key to breadcrumb type
      var keyToType = {
        boardId:  'board',
        threadId: 'thread',
      };
      // remove anchor hash from params
      var routeParamKeys = without(Object.keys(routeParams), '#');
      var keys = Object.keys(keyToType);
      var matches = intersection(routeParamKeys, keys);

      // matches, route is dynamic
      if (!isEmpty(matches)) {
        var idKey = routeParamKeys[0];
        Breadcrumbs.getBreadcrumbs({ id: routeParams[idKey], type: keyToType[idKey] },
        function(partialCrumbs) {
          breadcrumbs = breadcrumbs.concat(partialCrumbs);
          breadcrumbsStore = breadcrumbs;
        });
      }
      // routeParams is empty, route is static
      else {
        var pathArr = path.split('/');
        // Shifting array by one to eliminate empty index
        pathArr.shift();
        for (var i = 0, len = pathArr.length; i < len; i++) {
          var id = pathArr[i];
          var crumb = pathLookup[id] || { label: id };
          breadcrumbs.push(crumb);
          // ignore following crumbs if ignoreFollowing is true
          if (crumb.ignoreFollowing) { break; }
        }
        // Special case for extended profile pages. Allows link back to user
        // profile from breadcrumbs
        if (breadcrumbs[1].label === pathLookup.profiles.label && breadcrumbs.length > 3) {
          breadcrumbs[2].state = '^.profile.posts';
          breadcrumbs[2].opts = { username: breadcrumbs[2].label };
        }
        breadcrumbsStore = breadcrumbs;
      }

    },
    crumbs: function() {
      if (breadcrumbsStore) {
        for (var i = 0; i < breadcrumbsStore.length; i++) {
          breadcrumbsStore[i].label = decodeURIComponent(breadcrumbsStore[i].label);
        }
      }
      return breadcrumbsStore;
    }
  };
}];

angular.module('ept').service('BreadcrumbSvc', service);

