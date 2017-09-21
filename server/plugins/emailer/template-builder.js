var path = require('path');
var doT = require('dot');
var fs = require('fs');
var varsDir = '/../../../app/scss/ept/variables';
var defaultVarsPath = path.normalize(__dirname + varsDir + '/_default-variables.scss');
var customPath = '/../../../content/sass/_custom-variables.scss';
var customVarsPath = path.normalize(__dirname + customPath);

var css = function() {
  var varsPath = defaultVarsPath;
  if (fs.existsSync(customVarsPath)) {
    varsPath = customVarsPath;
  }

  var lines = fs.readFileSync(varsPath).toString().split('\n');

  var vars = {};

  lines.forEach(function(line) {
    var name = line.substr(line.indexOf('$') + 1, line.indexOf(':') - 1).trim();
    var splitName = name.split('-');
    for(var i = 1; i < splitName.length; i++) {
      splitName[i] = splitName[i].charAt(0).toUpperCase() + splitName[i].slice(1);
    }
    name = splitName.join('');
    var val = line.substr(line.indexOf(':') + 1, line.length).split(';')[0].trim();

    if (val && name){
      vars[name] = val;
    }
  });

  return vars;
};

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
      css: css(),
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
      css: css(),
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
      css: css(),
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
      css: css(),
      siteName: params.site_name,
      currentYear: currentYear,
      inviteUrl: params.invite_url
    })
  };
};

exports.threadNotification = function(sender, params) {
  var template = doT.template(templateFile('thread-notification.html'));
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.site_name}] New replies to thread "${params.thread_name}"`,
    html: template({
      css: css(),
      threadName: params.thread_name,
      username: params.username,
      siteName: params.site_name,
      currentYear: currentYear,
      threadUrl: params.thread_url
    })
  };
};
