'use strict';
/* jslint node: true */

module.exports = ['Session', '$state', '$filter', function(Session, $state, $filter) {
  var message;
  var boardBanned = false;
  var globallyBanned = Session.user.ban_expiration ? true : false;
  return {
    update: function(bannedFromBoard) {
      var banExpiration = Session.user.ban_expiration;
      boardBanned = bannedFromBoard;
      globallyBanned = banExpiration ? true : false
      // Sets board ban message, ignored if global ban is set
      if (boardBanned && !globallyBanned) {
        message = 'Read Only Access &mdash; You have been banned from this board';
      }
      // Sets global ban message if not already set
      else if (!boardBanned && globallyBanned) {
        var expirationStr = $filter('humanDate')(banExpiration, true);
        message = 'You have been banned ' +
          (expirationStr === 'Permanent' ?
          'Permanently' :
          'until ' + expirationStr);
      }
      // Clears ban message assuming the ban isn't global
      else { message = undefined; }
      return message;
    },
    isBanned: function() { return message; },
    banStatus: function() {  return boardBanned || globallyBanned; }
  };
}];
