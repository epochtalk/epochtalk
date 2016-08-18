var path = require('path');
var doT = require('dot');
var fs = require('fs');

var templateFile = function(filename) {
  return fs.readFileSync(path.join(__dirname, 'templates', filename));
};

exports.recoverAccount = function(sender, params) {
  var template = doT.template(templateFile('recover-account.html'));
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.siteName}] Account Recovery`,
    html: template({
      username: params.username,
      siteName: params.siteName,
      currentYear: currentYear,
      resetUrl: params.reset_url
    })
  };
};

exports.recoverSuccess = function(sender, params) {
  var template = doT.template(templateFile('recover-success.html'));
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.siteName}] Account Recovery Success`,
    html: template({
      username: params.username,
      siteName: params.siteName,
      currentYear: currentYear,
      forumUrl: params.forum_url
    })
  };
};

exports.confirmAccount = function(sender, params) {
  var template = doT.template(templateFile('confirm-account.html'));
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.siteName}] Account Confirmation`,
    html: template({
      username: params.username,
      siteName: params.siteName,
      currentYear: currentYear,
      confirmUrl: params.confirm_url
    })
  };
};
