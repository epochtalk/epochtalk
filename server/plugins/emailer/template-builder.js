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
    subject: `[${params.site_name}] Account Recovery`,
    html: template({
      username: params.username,
      siteName: params.site_name,
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
    subject: `[${params.site_name}] Account Recovery Success`,
    html: template({
      username: params.username,
      siteName: params.site_name,
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
    subject: `[${params.site_name}] Account Confirmation`,
    html: template({
      username: params.username,
      siteName: params.site_name,
      currentYear: currentYear,
      confirmUrl: params.confirm_url
    })
  };
};

exports.invite = function(sender, params) {
  var template = doT.template(templateFile('invitation.html'));
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.site_name}] You've been sent an invitation`,
    html: template({
      siteName: params.site_name,
      currentYear: currentYear,
      inviteUrl: params.invite_url
    })
  };
};
