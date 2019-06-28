var ctrl = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'ModerationLogs', 'moderationLogs', function($rootScope, $scope, $location, $timeout, $anchorScroll, ModerationLogs, moderationLogs) {
  var ctrl = this;
  this.parent = $scope.$parent.ModerationCtrl;
  this.parent.tab = 'logs';
  this.logs = moderationLogs.data;

  // Pagination Vars
  this.page = moderationLogs.page;
  this.limit = moderationLogs.limit;
  this.next = moderationLogs.next;
  this.prev = moderationLogs.prev;
  this.mod = moderationLogs.mod;
  this.action = moderationLogs.action;
  this.keyword = moderationLogs.keyword;
  this.bdate = moderationLogs.bdate;
  this.adate = moderationLogs.adate;
  this.sdate = moderationLogs.sdate;
  this.edate = moderationLogs.edate;

  // Action Types
  this.actionTypes =  [
    { group: 'User Report Actions',
      value: 'reports.updateUserReport',
      desc: 'Updated a User Report Status' },
    { group: 'User Report Actions',
      value: 'reports.createUserReportNote',
      desc: 'Created a User Report Note' },
    { group: 'User Report Actions',
      value: 'reports.updateUserReportNote',
      desc: 'Updated a User Report Note' },

    { group: 'Post Report Actions',
      value: 'reports.updatePostReport',
      desc: 'Updated a Post Report Status' },
    { group: 'Post Report Actions',
      value: 'reports.createPostReportNote',
      desc: 'Created a Post Report Note' },
    { group: 'Post Report Actions',
      value: 'reports.updatePostReportNote',
      desc: 'Updated a Post Report Note' },

    { group: 'Message Report Actions',
      value: 'reports.updateMessageReport',
      desc: 'Updated a Message Report Status' },
    { group: 'Message Report Actions',
      value: 'reports.createMessageReportNote',
      desc: 'Created a Message Report Note' },
    { group: 'Message Report Actions',
      value: 'reports.updateMessageReportNote',
      desc: 'Updated a Message Report Note' },

    { group: 'Role Actions',
      value: 'adminRoles.add',
      desc: 'Added a New Role' },
    { group: 'Role Actions',
      value: 'adminRoles.remove',
      desc: 'Removed a Role' },
    { group: 'Role Actions',
      value: 'adminRoles.update',
      desc: 'Updated a Role' },
    { group: 'Role Actions',
      value: 'adminRoles.reprioritize',
      desc: 'Reprioritized Roles' },

    { group: 'Settings Actions',
      value: 'adminSettings.update',
      desc: 'Updated Settings' },
    { group: 'Settings Actions',
      value: 'adminSettings.addToBlacklist',
      desc: 'Added to IP Blacklist' },
    { group: 'Settings Actions',
      value: 'adminSettings.updateBlacklist',
      desc: 'Updated a IP Blacklist Rule' },
    { group: 'Settings Actions',
      value: 'adminSettings.deleteFromBlacklist',
      desc: 'Deleted a IP Blacklist Rule' },
    { group: 'Settings Actions',
      value: 'adminSettings.setTheme',
      desc: 'Set the Forum Theme' },
    { group: 'Settings Actions',
      value: 'adminSettings.resetTheme',
      desc: 'Reverted to the Default Forum Theme' },

    { group: 'User Actions',
      value: 'users.update',
      desc: 'Updated User' },
    { group: 'User Actions',
      value: 'adminUsers.addRoles',
      desc: 'Added a Role to User' },
    { group: 'User Actions',
      value: 'adminUsers.removeRoles',
      desc: 'Removed a Role from User' },
    { group: 'User Actions',
      value: 'users.delete',
      desc: 'Deleted User' },
    { group: 'User Actions',
      value: 'users.deactivate',
      desc: 'Deactivated User' },
    { group: 'User Actions',
      value: 'users.reactivate',
      desc: 'Reactivated User' },
    { group: 'User Actions',
      value: 'userNotes.create',
      desc: 'Created User Moderation Note' },
    { group: 'User Actions',
      value: 'userNotes.update',
      desc: 'Updated User Moderation Note' },
    { group: 'User Actions',
      value: 'userNotes.delete',
      desc: 'Deleted User Moderation Note' },

    { group: 'Banning Actions',
      value: 'bans.ban',
      desc: 'Banned User' },
    { group: 'Banning Actions',
      value: 'bans.unban',
      desc: 'Unbanned User' },
    { group: 'Banning Actions',
      value: 'bans.banFromBoards',
      desc: 'Banned User From Board(s)' },
    { group: 'Banning Actions',
      value: 'bans.unbanFromBoards',
      desc: 'Unbanned User From Board(s)' },
    { group: 'Banning Actions',
      value: 'bans.addAddresses',
      desc: 'Banned an Address' },
    { group: 'Banning Actions',
      value: 'bans.editAddress',
      desc: 'Edited a Banned Address' },
    { group: 'Banning Actions',
      value: 'bans.deleteAddress',
      desc: 'Deleted a Banned Address' },

    { group: 'Board Actions',
      value: 'adminBoards.updateCategories',
      desc: 'Updated Boards/Categories' },
    { group: 'Board Actions',
      value: 'adminModerators.add',
      desc: 'Added Moderator(s)' },
    { group: 'Board Actions',
      value: 'adminModerators.remove',
      desc: 'Removed Moderator(s)' },
    { group: 'Board Actions',
      value: 'boards.create',
      desc: 'Created Board' },
    { group: 'Board Actions',
      value: 'boards.update',
      desc: 'Updated Board' },
    { group: 'Board Actions',
      value: 'boards.delete',
      desc: 'Deleted Board' },

    { group: 'Thread Actions',
      value: 'threads.title',
      desc: 'Edited Thread Title' },
    { group: 'Thread Actions',
      value: 'threads.sticky',
      desc: 'Stickied/Unstickied Thread' },
    { group: 'Thread Actions',
      value: 'threads.lock',
      desc: 'Locked/Unlocked Thread' },
    { group: 'Thread Actions',
      value: 'threads.move',
      desc: 'Moved Thread' },
    { group: 'Thread Actions',
      value: 'threads.purge',
      desc: 'Purged Thread' },
    { group: 'Thread Actions',
      value: 'threads.createPoll',
      desc: 'Created Thread Poll' },
    { group: 'Thread Actions',
      value: 'threads.editPoll',
      desc: 'Edited Thread Poll' },
    { group: 'Thread Actions',
      value: 'threads.lockPoll',
      desc: 'Locked Thread Poll' },

    { group: 'Post Actions',
      value: 'posts.update',
      desc: 'Edited User\'s Post' },
    { group: 'Post Actions',
      value: 'posts.delete',
      desc: 'Hid User\'s Post' },
    { group: 'Post Actions',
      value: 'posts.undelete',
      desc: 'Unhid User\'s Post' },
    { group: 'Post Actions',
      value: 'posts.purge',
      desc: 'Purged User\'s Post' },

    { group: 'Messaging Actions',
      value: 'conversations.delete',
      desc: 'Deleted Conversation' },
    { group: 'Messaging Actions',
      value: 'messages.delete',
      desc: 'Deleted Message' }
  ];

  this.selectedDateFilterType = '';
  this.dateFilterTypes = {
    between: 'Between',
    after: 'After',
    before: 'Before'
  };

  // Set Filter
  this.filter = {};

  this.filterResults = function() {
    if (ctrl.disableFilter()) { return; }

    $location.search({
      mod: ctrl.filter.mod || undefined,
      action: ctrl.filter.action || undefined,
      keyword: ctrl.filter.keyword || undefined,
      bdate: ctrl.filter.bdate || undefined,
      adate: ctrl.filter.adate || undefined,
      sdate: ctrl.filter.sdate || undefined,
      edate: ctrl.filter.edate || undefined,
      page: undefined,
      limit: ctrl.limit === 25 ? undefined : ctrl.limit
    });
  };

  // Raw Object Modal
  this.showRawObjectModal = false;
  this.selectedLog = null;

  this.showRawObject = function(log) {
    ctrl.showRawObjectModal = true;
    ctrl.selectedLog = angular.copy(log);
    delete ctrl.selectedLog.action_display_text;
    delete ctrl.selectedLog.action_display_url;
  };

  this.syntaxHighlight = function(json) {
    if (typeof json !== 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  };

  this.clearFilter = function() {
    $location.search({
      page: undefined,
      limit: ctrl.limit === 25 ? undefined : ctrl.limit
    });
  };

  this.disableFilter = function() {
    return (!ctrl.filter.mod && !ctrl.filter.action && !ctrl.filter.keyword && !ctrl.filter.bdate && !ctrl.filter.adate && !ctrl.filter.sdate && !ctrl.filter.edate) ||
      (ctrl.selectedDateFilterType === 'before' && !ctrl.filter.bdate) ||
      (ctrl.selectedDateFilterType === 'after' && !ctrl.filter.adate) ||
      (ctrl.selectedDateFilterType === 'between' && (!ctrl.filter.sdate || !ctrl.filter.edate));
  };

  this.disableClear = function() {
    var queryParams = $location.search();
    return !(queryParams.mod || queryParams.action || queryParams.keyword || queryParams.bdate || queryParams.adate || queryParams.sdate || queryParams.edate);
  };

  // init method (handles initial page load and back button)
  function init() {
    var queryParams = $location.search();
    ctrl.filter = {
      mod: queryParams.mod,
      action: queryParams.action,
      keyword: queryParams.keyword,
      bdate: queryParams.bdate ? new Date(queryParams.bdate) : undefined,
      adate: queryParams.adate ? new Date(queryParams.adate) : undefined,
      sdate: queryParams.sdate ? new Date(queryParams.sdate) : undefined,
      edate: queryParams.edate ? new Date(queryParams.edate) : undefined
    };

    if (queryParams.bdate) { ctrl.selectedDateFilterType = 'before'; }
    else if (queryParams.adate) { ctrl.selectedDateFilterType = 'after'; }
    else if (queryParams.sdate && queryParams.edate) { ctrl.selectedDateFilterType = 'between'; }
    else { ctrl.selectedDateFilterType = ''; }
  }

  // Call init
  init();

  $timeout($anchorScroll);
  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {

    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 25;
    var mod = params.mod;
    var action = params.action;
    var keyword = params.keyword;
    var bdate = params.bdate;
    var adate = params.adate;
    var sdate = params.sdate;
    var edate = params.edate;

    var pageChanged = false;
    var limitChanged = false;
    var modChanged = false;
    var actionChanged = false;
    var keywordChanged = false;
    var bdateChanged = false;
    var adateChanged = false;
    var sdateChanged = false;
    var edateChanged = false;

    if ((page === undefined || page) && page !== ctrl.page) {
      pageChanged = true;
      ctrl.page = page;
    }
    if ((limit === undefined || limit) && limit !== ctrl.limit) {
      limitChanged = true;
      ctrl.limit = limit;
    }
    if ((mod === undefined || mod) && mod !== ctrl.mod) {
      modChanged = true;
      ctrl.mod = mod;
    }
    if ((action === undefined || action) && action !== ctrl.action) {
      actionChanged = true;
      ctrl.action = action;
    }
    if ((keyword === undefined || keyword) && keyword !== ctrl.keyword) {
      keywordChanged = true;
      ctrl.keyword = keyword;
    }
    if ((bdate === undefined || bdate) && bdate !== ctrl.bdate) {
      bdateChanged = true;
      ctrl.bdate = bdate;
    }
    if ((adate === undefined || adate) && adate !== ctrl.adate) {
      adateChanged = true;
      ctrl.adate = adate;
    }
    if ((sdate === undefined || sdate) && sdate !== ctrl.sdate) {
      sdateChanged = true;
      ctrl.sdate = sdate;
    }
    if ((edate === undefined || edate) && edate !== ctrl.edate) {
      edateChanged = true;
      ctrl.edate = edate;
    }
    if (pageChanged || limitChanged || modChanged || actionChanged || keywordChanged || bdateChanged || adateChanged || sdateChanged || edateChanged) { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      page: ctrl.page,
      limit: ctrl.limit || undefined,
      mod: ctrl.mod,
      action: ctrl.action,
      keyword: ctrl.keyword,
      bdate: ctrl.bdate,
      adate: ctrl.adate,
      sdate: ctrl.sdate,
      edate: ctrl.edate
    };

    // replace current reports with new mods
    ModerationLogs.page(query).$promise
    .then(function(newLogs) {
      ctrl.logs = newLogs.data;
      ctrl.page = newLogs.page;
      ctrl.limit = newLogs.limit;
      ctrl.next = newLogs.next;
      ctrl.prev = newLogs.prev;
      ctrl.mod = newLogs.mod;
      ctrl.action = newLogs.action;
      ctrl.keyword = newLogs.keyword;
      ctrl.bdate = newLogs.bdate;
      ctrl.adate = newLogs.adate;
      ctrl.sdate = newLogs.sdate;
      ctrl.edate = newLogs.edate;

      init();
    });
  };
}];

module.exports = angular.module('ept.admin.moderation.logs.ctrl', [])
.controller('ModLogsCtrl', ctrl);
