var service = ['Notifications', 'Mentions', 'Alert', function(Notifications, Mentions, Alert) {

  var messages = 0;
  var mentions = 0;
  var mentionsList = [];


  function refreshMentionsList() {
    return Mentions.page({ limit: 10 }).$promise
    .then(function(dbMentions) {
      mentionsList = dbMentions.data;
    })
    .catch(console.log);
  }

  function refresh() {
    return Notifications.counts({ max: 99 }).$promise
    .then(function(counts) {
      messages = counts.message;
      mentions = counts.mention;
    })
    .catch(console.log);
  }

  function dismiss(opts) {
    if (opts.viewed) { return; }
    else {
      delete opts.viewed;
      return Notifications.dismiss(opts).$promise
      .catch(function(err) {
        Alert.error('There was an error dismissing your notifications.');
        console.log(err);
      });
    }
  }

  function deleteMention(opts) {
    // TODO: This should go away once we get rid of the Notifications table
    return Notifications.dismiss({ type: opts.type, id: opts.notification_id }).$promise
    .then(function() {
      return Mentions.remove(opts).$promise;
    })
    .catch(function(err) {
      Alert.error('There was an error dismissing your mentions.');
      console.log(err);
    });
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
    getMentionsList: getMentionsList,
    deleteMention: deleteMention
  };
}];

angular.module('ept').service('NotificationSvc', service);
