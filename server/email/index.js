var path = require('path');
var config = require(path.join(__dirname, '..', 'config'));
var _ = require('lodash');
var fs = require('fs');

module.exports = {
  recoverAccount: function (email, username, resetToken) {
    var template = _.template(fs.readFileSync(__dirname + '/templates/recover-account.html'));
    return {
      from: config.senderEmail,
      to: email,
      subject: '[EpochTalk] Account Recovery',
      html: template({ username: username, rootUrl: config.hostUrl, resetToken: resetToken})
    };
  }
};
