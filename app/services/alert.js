'use strict';
/* jslint node: true */
/* global angular */

var _ = require('lodash');

module.exports = [function() {
    var alerts = [];
    var id = 0;

    // Service API
    var serviceAPI = {
      getAlerts: function() { return alerts; },
      success: function(message) {
        alerts.push({ id: id, type: 'success', message: message });
        id = ++id;
      },
      info: function(message) {
        alerts.push({ id: id, type: 'info', message: message });
        id = ++id;
      },
      warning: function(message) {
        alerts.push({ id: id, type: 'warning', message: message });
        id = ++id;
      },
      error: function(message) {
        alerts.push({ id: id, type: 'alert', message: message });
        id = ++id;
      },
      removeAlert: function(id) {
        _.remove(alerts, function(alert) { return alert.id === id; });
      }
    };

    return serviceAPI;
  }
];
