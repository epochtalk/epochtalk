var path = require('path');
var mustache = require('mustache');
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
  return fs.readFileSync(path.join(__dirname, 'templates', filename)).toString().split('\n').map(s => s.trim()).join('');
};

exports.recoverAccount = function(sender, params) {
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.site_name}] Account Recovery`,
    html: mustache.render(templateFile('recover-account.html'), {
      css: css(),
      username: params.username,
      siteName: params.site_name,
      currentYear: currentYear,
      resetUrl: params.reset_url
    })
  };
};

exports.recoverSuccess = function(sender, params) {
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.site_name}] Account Recovery Success`,
    html: mustache.render(templateFile('recover-success.html'), {
      css: css(),
      username: params.username,
      siteName: params.site_name,
      currentYear: currentYear,
      forumUrl: params.forum_url
    })
  };
};

exports.confirmAccount = function(sender, params) {
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.site_name}] Account Confirmation`,
    html: mustache.render(templateFile('confirm-account.html'), {
      css: css(),
      username: params.username,
      siteName: params.site_name,
      currentYear: currentYear,
      confirmUrl: params.confirm_url
    })
  };
};

exports.invite = function(sender, params) {
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.site_name}] You've been sent an invitation`,
    html: mustache.render(templateFile('invitation.html'), {
      css: css(),
      siteName: params.site_name,
      currentYear: currentYear,
      inviteUrl: params.invite_url
    })
  };
};

exports.threadNotification = function(sender, params) {
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.site_name}] New replies to thread "${params.thread_name}"`,
    html: mustache.render(templateFile('thread-notification.html'), {
      css: css(),
      threadName: params.thread_name,
      siteName: params.site_name,
      currentYear: currentYear,
      threadUrl: params.thread_url
    })
  };
};

exports.newPM = function(sender, params) {
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.site_name}] ${params.sender} sent you a private message!`,
    html: mustache.render(templateFile('new-pm.html'), {
      css: css(),
      sender: params.sender,
      subject: params.subject,
      siteName: params.site_name,
      currentYear: currentYear,
      messageURL: params.message_url
    })
  };
};

exports.mentionNotification = function(sender, params) {
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.site_name}] New mention in thread "${params.thread_name}"`,
    html: mustache.render(templateFile('mention-notification.html'), {
      css: css(),
      threadName: params.thread_name,
      postAuthor: params.post_author,
      siteName: params.site_name,
      currentYear: currentYear,
      threadUrl: params.thread_url
    })
  };
};

exports.postUpdated = function(sender, params) {
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.site_name}] Your post in thread "${params.thread_name}" has been ${params.action}`,
    html: mustache.render(templateFile('post-updated.html'), {
      css: css(),
      threadName: params.thread_name,
      modUsername: params.mod_username,
      siteName: params.site_name,
      currentYear: currentYear,
      action: params.action,
      threadUrl: params.thread_url
    })
  };
};

exports.threadDeleted = function(sender, params) {
  var currentYear = new Date().getFullYear();
  return {
    from: sender,
    to: params.email,
    subject: `[${params.site_name}] "${params.thread_name}" a thread that you ${params.action}, has been deleted`,
    html: mustache.render(templateFile('thread-delete.html'), {
      css: css(),
      threadName: params.thread_name,
      modUsername: params.mod_username,
      siteName: params.site_name,
      currentYear: currentYear,
      action: params.action,
      siteUrl: params.site_url
    })
  };
};
