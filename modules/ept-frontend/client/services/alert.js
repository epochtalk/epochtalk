module.exports = [function() {
  var alerts = [];
  var id = 0;

  // Service API
  var serviceAPI = {
    getAlerts: function() { return alerts; },
    success: function(message) {
      alerts.unshift({ id: id, type: 'success', message: message });
      id = ++id;
    },
    info: function(message) {
      alerts.unshift({ id: id, type: 'info', message: message });
      id = ++id;
    },
    warning: function(message) {
      alerts.unshift({ id: id, type: 'warning', message: message });
      id = ++id;
    },
    error: function(message) {
      alerts.unshift({ id: id, type: 'error', message: message });
      id = ++id;
    },
  };

  return serviceAPI;
}];
