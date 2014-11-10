var path = require('path');
var config = require(path.join(__dirname, 'config'));

module.exports = {
  recoverAccount: function (email, username, resetToken) {
    return {
      from: config.senderEmail,
      to: email,
      subject: '[EpochTalk] Account Recovery',
      html: 'Visit the link below to reset your user password: <br /><br />' +
            '<strong>Username</strong>: ' + username + '<br />' +
            '<strong>Password</strong>: <a href="' + config.hostUrl + ':' + config.port +
            '/reset/' + username + '/' + resetToken + '">Reset</a>'
    };
  }
};
