var service = ['User', '$window', function(User, $window) {
    var preferences = {};
    var storage = {}; // fallback for safari private browser
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

    // Attempt to retrieve preferences from storage
    try {
      preferences = {
        posts_per_page: Number(storage.posts_per_page) || 25,
        threads_per_page: Number(storage.threads_per_page) || 25,
      };
      if (storage.collapsed_categories) {
        preferences.collapsed_categories = JSON.parse(storage.collapsed_categories);
      }
      if (storage.ignored_boards) {
        preferences.ignored_boards = JSON.parse(storage.ignored_boards);
      }
    }
    catch(err) { console.log('Error parsing preferences from storage: ', err); }

    function loadContainer(newPref, container, isStorage) {
      container.posts_per_page = newPref.posts_per_page;
      container.threads_per_page = newPref.threads_per_page;
      if (isStorage) {
        container.collapsed_categories = JSON.stringify(newPref.collapsed_categories || []);
        container.ignored_boards = JSON.stringify(newPref.ignored_boards || []);
      }
      else {
        container.collapsed_categories = newPref.collapsed_categories || [];
        container.ignored_boards = newPref.ignored_boards || [];
      }
    }

    function clearContainer(container) {
      delete container.posts_per_page;
      delete container.threads_per_page;
      delete container.collapsed_categories;
      delete container.ignored_boards;
    }

    // Service API
    var preferencesAPI = {
      preferences: preferences,
      pullPreferences: function() {
        return User.preferences().$promise
        .then(function(extPrefs) {
          loadContainer(extPrefs, storage, true);
          loadContainer(extPrefs, preferences, false);
        });
      },
      setPreferences: function(newPref) {
        loadContainer(newPref, storage, true);
        loadContainer(newPref, preferences, false);
      },
      clearPreferences: function() {
        clearContainer(preferences);
        clearContainer(storage);
      },
      getPreferences: function() { return preferences; }
    };

    return preferencesAPI;
  }
];

angular.module('ept').service('PreferencesSvc', service);

