'use strict';
/* jslint node: true */

module.exports = ['Notifications', function(Notifications) {

  var messages = 0;
  var mentions = 0;

  function getMessages() { return messages; }

  function getMentions() { return mentions; }

  function refresh() {
    return Notifications.counts().$promise
    .then(function(counts) {
      messages = counts.message;
      mentions = counts.mention;
    });
  }

  function dismiss(type) {
    var query = { type: type };
    return Notifications.dismiss(query).$promise
    .then(function() { refresh(); });
  }

  return {
    getMessages: getMessages,
    getMentions: getMentions,
    refresh: refresh,
    dismiss: dismiss
  };
}];
