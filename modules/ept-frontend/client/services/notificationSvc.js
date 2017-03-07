'use strict';
/* jslint node: true */

module.exports = ['Notifications', 'Mentions', function(Notifications, Mentions) {

  var messages = 0;
  var mentions = 0;
  var mentionsList = [];

  function refreshMentionsList() {
    return Mentions.latest({ limit: 10 }).$promise
    .then(function(dbMentionsList) {
      mentionsList = dbMentionsList;
    });
  }

  function refresh() {
    return Notifications.counts({ max: 99 }).$promise
    .then(function(counts) {
      messages = counts.message;
      mentions = counts.mention;
    });
  }

  function dismiss(opts) {
    if (opts.viewed) { return; }
    else {
      delete opts.viewed;
      return Notifications.dismiss(opts).$promise
      .then(function() {
        refresh();
        refreshMentionsList();
      });
    }
  }

  function getMentionsList() {
    return mentionsList;
  }

  function getMessages() { return messages; }

  function getMentions() { return mentions; }

  return {
    getMessages: getMessages,
    getMentions: getMentions,
    refresh: refresh,
    dismiss: dismiss,
    refreshMentionsList: refreshMentionsList,
    getMentionsList: getMentionsList
  };
}];
