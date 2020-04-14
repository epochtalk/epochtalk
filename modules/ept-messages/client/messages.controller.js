var ctrl = [
  '$scope', '$rootScope', '$timeout', '$window', '$anchorScroll', 'Session', 'Alert', 'Messages', 'Conversations', 'User', 'Reports', 'pageData', 'Websocket',
  function($scope, $rootScope, $timeout, $window, $anchorScroll, Session, Alert, Messages, Conversations, User, Reports, pageData, Websocket) {
    var ctrl = this;
    this.currentUserId = Session.user.id;
    this.username = Session.user.username;
    this.recentMessages = pageData.messages;
    this.totalMessageCount = pageData.total_convo_count;
    this.page = pageData.page;
    this.limit = pageData.limit;
    this.pageMax = Math.ceil(pageData.total_convo_count / pageData.limit);
    this.currentConversation = {messages: []};
    this.selectedConversationId = null;
    this.receiverNames = null;
    this.newMessage = { content: { body: '', body_html: '' }, receiver_ids: [], receiver_usernames: [] };
    this.showReply = false;
    this.currentSubject = '';

    this.canCreateMessage = function() {
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('messages.create.allow')) { return false; }
      return true;
    };

    this.canDeleteConversation = function() {
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('conversations.delete.allow')) { return false; }
      return true;
    };

    this.canDeleteMessage = function(messageUserId) {
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('messages.delete.allow')) { return false; }

      // ownership
      var owner = false;
      if (messageUserId === Session.user.id) { owner = true; }
      else if (Session.hasPermission('messages.delete.bypass.owner')) { owner = true; }
      return owner;
    };

    this.canCreateConversation = function () {
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('conversations.create.allow')) { return false; }
      return true;
    };

    this.controlAccess = {
      reportMessages: Session.hasPermission('reports.createMessageReport')
    };

    // page exiting functions
    var confirmMessage = 'It looks like a message is being written.';
    var exitFunction = function() {
      if (ctrl.newMessage.content.body.length) { return confirmMessage; }
    };
    $window.onbeforeunload = exitFunction;
    var routeLeaveFunction = function() {
      return $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState) {
        if (toState.url === fromState.url) { return; }
        if (ctrl.newMessage.content.body.length) {
          var message = confirmMessage + ' Are you sure you want to leave?';
          var answer = confirm(message);
          if (!answer) { e.preventDefault(); }
        }
      });
    };
    var destroyRouteBlocker = routeLeaveFunction();
    $scope.$on('$destroy', function() {
      $window.onbeforeunload = undefined;
      if (destroyRouteBlocker) { destroyRouteBlocker(); }
    });

    this.listMessageReceivers = function(message) {
      var receiverNames = [];
      message.receivers.forEach(function(receiver) {
        receiverNames.push(receiver.username);
      });
      var authedIndex = receiverNames.indexOf(Session.user.username);
      if (authedIndex > -1) {
        receiverNames.splice(authedIndex, 1);
        receiverNames.push(message.sender_username);
      }
      return receiverNames.join(', ');
    };

    this.receivers = [];

    this.loadTags = function(query) {
      return User.lookup({ self: true, username: query }).$promise
      .then(function(users) { return users; });
    };

    // Conversations

    this.loadConversation = function(conversationId, options) {
      options = options || {};
      ctrl.selectedConversationId = conversationId;
      ctrl.recentMessages.forEach(function(message) {
        if (message.conversation_id === conversationId) { viewed = true; }
      });
      return Conversations.messages({ id: conversationId }).$promise
      // build out conversation information
      .then(function(data) {
        ctrl.currentSubject = data.messages[0].content.subject;
        ctrl.currentConversation = data;
        ctrl.currentConversation.id = conversationId;
        if (options.saveInput) {
          ctrl.newMessage.subject = ctrl.newMessage.subject || ctrl.currentConversation.subject;
          ctrl.newMessage.content.body = ctrl.newMessage.content.body || '';
          ctrl.newMessage.content.body_html = ctrl.newMessage.content.body_html || '';
        }
        else {
          ctrl.newMessage = { subject: ctrl.currentConversation.subject, content: { body_html: '', body: '' } };
        }
        ctrl.newMessage.conversation_id = data.id;
        ctrl.newMessage.sender_id = Session.user.id;
        ctrl.newMessage.sender_username = Session.user.username;
        var lastMessage = data.messages[data.messages.length - 1];
        var lastReceiverIds = lastMessage.receiver_ids;
        var lastReceiverUsernames = lastMessage.receivers.map(function(receiver) { return receiver.username; });
        var lastSenderId = lastMessage.sender_id;
        var lastSenderUsername = lastMessage.sender_username;
        if (Session.user.id !== lastSenderId) {
          // Remove current users id from list of receivers and add senders id
          var idIndex = lastReceiverIds.indexOf(Session.user.id);
          if (idIndex > -1) { lastReceiverIds.splice(idIndex, 1); }
          lastReceiverIds.push(lastSenderId);

          // Remove current users username from list of receivers and add senders id
          var usernameIndex = lastReceiverUsernames.indexOf(Session.user.username);
          if (usernameIndex > -1) { lastReceiverUsernames.splice(usernameIndex, 1); }
          lastReceiverUsernames.push(lastSenderUsername);
        }
        ctrl.newMessage.receiver_ids = lastReceiverIds;
        ctrl.newMessage.receiver_usernames = lastReceiverUsernames;

        ctrl.receiverNames = lastReceiverUsernames;
      })
      // scroll last message into view
      .then(function() { $anchorScroll(); });
    };

    if (this.recentMessages.length) {
      this.loadConversation(this.recentMessages[0].conversation_id);
    }

    this.loadMoreMessages = function() {
      var query = {
        id: ctrl.currentConversation.id,
        timestamp: ctrl.currentConversation.last_message_timestamp,
        message_id: ctrl.currentConversation.last_message_id
      };
      return Conversations.messages(query).$promise
      // build out conversation information
      .then(function(data) {
        ctrl.currentConversation.messages = ctrl.currentConversation.messages.concat(data.messages);
        ctrl.currentConversation.last_message_id = data.last_message_id;
        ctrl.currentConversation.last_message_timestamp = data.last_message_timestamp;
        ctrl.currentConversation.has_next = data.has_next;
        return data;
      });
    };

    this.hasMoreMessages = function() { return ctrl.currentConversation.has_next; };

    this.createConversation = function() {
      var receiverIds = [];
      ctrl.receivers.forEach(function(user) { receiverIds.push(user.id); });

      // create a new conversation id to put this message under
      ctrl.newMessage.receiver_ids = receiverIds;
      return Conversations.save(ctrl.newMessage).$promise
      .then(function(savedMessage) {
        // open conversation
        ctrl.loadConversation(savedMessage.conversation_id);

        // Add message to list
        savedMessage.receiver_usernames = ctrl.newMessage.receiver_usernames;
        savedMessage.sender_username = Session.user.username;
        Alert.success('New Conversation Started!');
        ctrl.loadRecentMessages();
      })
      .catch(function(err) {
        var msg = 'Failed to create conversation';
        if (err && err.status === 403) { msg = err.data.message; }
        Alert.error(msg);
      })
      .finally(function() {
        ctrl.receivers = [];
        ctrl.newMessage.receiver_ids = [];
        ctrl.newMessage.content = { subject: '', body: '', body_html: '' };
        closeEditor();
      });
    };

    // Websocket Handling
    function userChannelHandler(data) {
      if (data.action === 'newMessage') {
        ctrl.loadRecentMessages(ctrl.page, ctrl.limit);
        if (ctrl.selectedConversationId === data.conversationId) {
          ctrl.loadConversation(ctrl.selectedConversationId, { saveInput: true });
        }
      }
    }

    Websocket.watchUserChannel(userChannelHandler);
    $scope.$on('$destroy', function() { Websocket.unwatchUserChannel(userChannelHandler); });

    // Messages
    this.loadRecentMessages = function(page, limit) {
      if (page <= 0 || page > ctrl.pageMax) { return; }
      page = page || 1;
      limit = limit || 15;
      return Messages.latest({ page: page, limit: limit}).$promise
      .then(function(data) {
        ctrl.recentMessages = data.messages;
        ctrl.currentSubject = data.messages[0].content.subject;
        ctrl.totalConvoCount = data.total_convo_count;
        ctrl.limit = data.limit;
        ctrl.page = data.page;
        ctrl.pageMax = Math.ceil(data.total_convo_count / data.limit);

      })
      .catch(function(err) {
        var msg = 'Messages could not be loaded';
        if (err && err.status === 403) { msg = err.data.message; }
        Alert.error(msg);
      });
    };

    this.saveMessage = function() {
      return Messages.save(ctrl.newMessage).$promise
      .then(function(message) {
        message.receiver_usernames = ctrl.newMessage.receiver_usernames;
        message.sender_username = ctrl.newMessage.sender_username;
        message.sender_avatar = Session.user.avatar;
        ctrl.currentConversation.messages.unshift(message);
        Alert.success('Reply sent to ' + message.receiver_usernames.join(', '));
      })
      .then(ctrl.loadRecentMessages)
      .then(function() {
        ctrl.newMessage.content = { body: '', body_html: '' };
        ctrl.currentConversation.messages.forEach(function(message) {
          message.viewed = true;
        });
        closeEditor();
      })
      .catch(function(err) {
        var msg = 'Message could not be sent';
        if (err && err.status === 403) { msg = err.data.message; }
        Alert.error(msg);
      });
    };

    this.deleteMessageId = '';
    this.showDeleteModal = false;
    this.closeDeleteModal = function() {
      $timeout(function() { ctrl.showDeleteModal = false; });
    };
    this.openDeleteModal = function(messageId) {
      ctrl.deleteMessageId = messageId;
      ctrl.showDeleteModal = true;
    };
    this.deleteMessage = function() {
      Messages.delete({id: ctrl.deleteMessageId}).$promise
      .then(function() {
        var messages = [];
        ctrl.currentConversation.messages.forEach(function(message) {
          if (message.id === ctrl.deleteMessageId) { return; }
          else { messages.push(message); }
        });
        ctrl.currentConversation.messages = messages;
        ctrl.loadRecentMessages();
      })
      .catch(function() {Alert.error('Failed to delete message'); })
      .finally(function() { ctrl.showDeleteModal = false; });
    };


    this.deleteConversationId = '';
    this.showDeleteConvoModal = false;
    this.closeDeleteConvoModal = function() {
      $timeout(function() { ctrl.showDeleteConvoModal = false; });
    };
    this.openDeleteConvoModal = function(conversationId) {
      ctrl.deleteConversationId = conversationId;
      ctrl.showDeleteConvoModal = true;
    };
    this.deleteConversation = function() {
      Conversations.delete({id: ctrl.deleteConversationId}).$promise
      .then(function() {
        var filteredMessages = ctrl.recentMessages.filter(function(el) {
          return el.conversation_id != ctrl.deleteConversationId;
        });

        ctrl.recentMessages = filteredMessages;

        if (ctrl.recentMessages.length) {
          ctrl.loadConversation(ctrl.recentMessages[0].conversation_id);
        }
        else { ctrl.currentConversation = { messages: [] }; }
      })
      .catch(function() {Alert.error('Failed to delete conversation'); })
      .finally(function() { ctrl.showDeleteConvoModal = false; });
    };


    this.reportedMessage = null;
    this.reportReason = '';
    this.reportBtnLabel = 'Report Message';
    this.showReportModal = false;
    this.reportSubmitted = false;
    this.closeReportModal = function() {
      if (!ctrl.reportSubmitted) { ctrl.reportedMessage = null; }
      $timeout(function() {
        if (ctrl.reportedMessage) { ctrl.reportedMessage.reported = true; }
        ctrl.showReportModal = false;
        ctrl.reportedMessage = null;
        ctrl.reportReason = '';
        ctrl.reportBtnLabel = 'Report Message';
      }, 500);
    };
    this.openReportModal = function(message) {
      ctrl.reportedMessage = message;
      ctrl.showReportModal = true;
    };
    this.submitReport = function() {
      ctrl.reportSubmitted = true;
      ctrl.reportBtnLabel = 'Submitting...';
      var report = { // build report
        reporter_user_id: ctrl.currentUserId,
        reporter_reason: ctrl.reportReason,
        offender_message_id: ctrl.reportedMessage.id
      };

      Reports.createMessageReport(report).$promise
      .then(function() {
        ctrl.closeReportModal();
        $timeout(function() { Alert.success('Successfully sent report'); }, 500);
      })
      .catch(function() {
        ctrl.closeReportModal();
        $timeout(function() { Alert.error('Error sending report, please try again later'); }, 500);
      })
      .finally(function() {
        $timeout(function() { ctrl.reportSubmitted = false; }, 500);
      });
    };

    // Editor
    this.dirtyEditor = false;
    this.resetEditor = false;
    this.showEditor = false;
    this.focusEditor = false;
    this.isMinimized = true;
    this.resize = true;
    this.content = { post: { body_html: '', body: '' } };
    this.editorPosition = 'editor-fixed-bottom';

    this.fullscreen = function() {
      if (ctrl.isMinimized) {
        ctrl.isMinimized = false;
        this.editorPosition = 'editor-full-screen';
        this.resize = false;
      }
      else {
        ctrl.isMinimized = true;
        this.editorPosition = 'editor-fixed-bottom';
        this.resize = true;
      }
    };

    /* Post Methods */

    var discardAlert = function() {
      if (ctrl.dirtyEditor) {
        var message = 'It looks like you were working on something. ';
        message += 'Are you sure you want to leave that behind?';
        return confirm(message);
      }
      else { return true; }
    };

    function closeEditor() {
      ctrl.newMessage.content = { body: '', body_html: '' };
      ctrl.resetEditor = true;
      ctrl.showEditor = false;
      ctrl.showFormatting = false;
    }

    this.loadEditor = function(focus) {
      if (discardAlert()) {
        var editorMsg = ctrl.newMessage;
        ctrl.receivers = [];
        editorMsg.subject = '';
        editorMsg.content.body_html = '';
        editorMsg.content.body = '';
        ctrl.resetEditor = true;
        ctrl.showEditor = true;
        if (focus === false) { ctrl.focusEditor = false; }
        else { ctrl.focusEditor = true; }
      }
    };

    this.cancelMsg = function() { if (discardAlert()) { closeEditor(); } };

  }
];

module.exports = angular.module('ept.messages.ctrl', [])
.controller('MessagesCtrl', ctrl);
