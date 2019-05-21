var includes = require('lodash/includes');
var get = require('lodash/get');

module.exports = ['$window', function($window) {
    var user = {};
    var storage = {}; // fallback for safari private browser
    var authenticated = false;
    var hasLocalStorage = checkLocalStorage();
    if (hasLocalStorage) { storage = $window.localStorage; }

    function checkLocalStorage() {
      var testKey = 'test';
      var storage = $window.localStorage;
      try {
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return true;
      }
      catch (error) { return false; }
    }

    // Attempt to retrieve and auth user from storage
    try {
      user = {
        id: storage.id,
        username: storage.username,
        avatar: storage.avatar,
      };
      if (storage.malicious_score) {
        user.malicious_score = storage.malicious_score;
      }
      if (storage.ban_expiration) {
        user.ban_expiration = storage.ban_expiration;
        // check if ban has expired remove if it has
        if (new Date(storage.ban_expiration) < new Date()) { delete storage.ban_expiration; }
      }
      if (storage.roles) { user.roles = JSON.parse(storage.roles); }
      if (storage.moderatings) { user.moderating = JSON.parse(storage).moderating; }
      if (storage.permissions) { user.permissions = JSON.parse(storage.permissions); }
      if (storage.token) { authenticated = true; }
    }
    catch(err) { console.log('Error parsing user from storage: ', err); }

    function loadContainer(newUser, container, isStorage) {
      container.id = newUser.id;
      container.username = newUser.username;
      container.avatar = newUser.avatar;
      if (newUser.malicious_score) {
        container.malicious_score = newUser.malicious_score;
      }
      else if (container.malicious_score && !newUser.malicious_score) {
        delete container.malicious_score;
      }
      if (newUser.ban_expiration) {
        container.ban_expiration = newUser.ban_expiration;
        // check if ban has expired remove if it has
        if (new Date(container.ban_expiration) < new Date()) { delete container.ban_expiration; }
      }
      else if (container.ban_expiration && !newUser.ban_expiration) {
        delete container.ban_expiration;
      }
      if (isStorage) {
        container.token = newUser.token;
        container.roles = JSON.stringify(newUser.roles || []);
        container.moderating = JSON.stringify(newUser.moderating || []);
        container.permissions = JSON.stringify(newUser.permissions || {});
      }
      else {
        container.roles = newUser.roles || [];
        container.moderating = newUser.moderating || [];
        container.permissions = newUser.permissions || [];
      }
    }

    function clearContainer(container) {
      delete container.id;
      delete container.username;
      delete container.avatar;
      delete container.malicious_score;
      delete container.ban_expiration;
      delete container.roles;
      delete container.moderating;
      delete container.permissions;
      delete container.token;
    }

    function hasPermission(permission) {
      return get(user.permissions, permission);
    }

    function moderatesBoard(boardId) {
      return includes(user.moderating, boardId);
    }

    function getPriority() {
      var priority = Number.MAX_SAFE_INTEGER;
      if (user.permissions) { priority = user.permissions.priority; }
      if (!isNaN(parseFloat(priority)) && isFinite(priority)) { return priority; }
      else { return Number.MAX_SAFE_INTEGER; }
    }

    function globalModeratorCheck() {
      var globalMod = false;
      if (user.permissions) {
        var globalModPermissions = [
          'posts.update.bypass.owner.admin',
          'threads.title.bypass.owner.admin',
          'threads.lock.bypass.owner.admin',
          'threads.sticky.bypass.owner.admin',
          'threads.move.bypass.owner.admin',
          'threads.purge.bypass.owner.admin',
          'threads.lockPoll.bypass.owner.admin'
        ];
        // If user has any of the permissions above set to true they are a global mod
        globalModPermissions.forEach(function(permission) {
          var allPermission = get(user.permissions, permission);
          globalMod = globalMod || allPermission;
        });
      }
      return globalMod;
    }

    function getControlAccess(permission, boardId) {
      var result = {};
      var isMod = moderatesBoard(boardId);
      if (user.permissions) {
        var obj = get(user.permissions, permission);
        for (var key in obj) {
          if (typeof obj[key] === 'boolean') { result[key] = obj[key]; }
          else { result[key] = (isMod && obj[key].some) || obj[key].all; }
        }
      }
      return result;
    }

    function getModPanelControlAccess() {
      var result = {};
      if (user.permissions) {
        var perm = function(p) {
          p = get(user.permissions, p);
          p = p ? p : false; // change undefined to false
          return (typeof p === 'boolean') ? p : (p.some || p.all || p.samePriority || p.lowerPriority || false);
        };
        // Retrieve specific permissions used to display mod actions in moderation pages
        result.postControls = {
          privilegedDelete: perm('posts.delete.bypass.locked'),
          privilegedUpdate: perm('posts.update.bypass.owner'),
          privilegedPurge: perm('posts.purge.bypass.purge'),
        };
        result.userControls = {
          privilegedBan: perm('bans.ban.allow'),
          privilegedBanFromBoards: perm('bans.banFromBoards.allow')
        };
        result.messageControls = hasPermission('messages');
        if (result.messageControls) {
          result.messageControls.createConversations = perm('conversations.create.allow');
        }
        result.reportControls = hasPermission('reports');
      }
      return result;
    }

    function getControlAccessWithPriority(permission, othersPriority) {
      var result = {};
      if (user.permissions) {
        var authedPriority = user.permissions.priority;
        if (othersPriority === null || othersPriority === undefined) { othersPriority = Number.MAX_VALUE; }
        var obj = get(user.permissions, permission);
        for (var key in obj) {
          var samePriority = obj[key].samePriority;
          var lowerPriority = obj[key].lowerPriority;
          if (samePriority) { result[key] = authedPriority <= othersPriority; }
          else if (lowerPriority) { result[key] = authedPriority < othersPriority; }
          else { result[key] = obj[key]; }
        }
      }
      return result;
    }

    // Service API
    var serviceAPI = {
      user: user,
      setUser: function(newUser) {
        authenticated = true;
        loadContainer(newUser, storage, true);
        loadContainer(newUser, user, false);
      },
      setUsername: function(username) { user.username = username; },
      setAvatar: function(avatar) { user.avatar = avatar; },
      clearUser: function() {
        authenticated = false;
        clearContainer(user);
        clearContainer(storage);
      },
      getPriority: getPriority,
      hasPermission: hasPermission,
      moderatesBoard: moderatesBoard,
      globalModeratorCheck: globalModeratorCheck,
      getModPanelControlAccess: getModPanelControlAccess,
      getControlAccess: getControlAccess,
      getControlAccessWithPriority: getControlAccessWithPriority,
      getToken: function() { return storage.token; },
      isAuthenticated: function() { return authenticated; }
    };

    return serviceAPI;
  }
];
