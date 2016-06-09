var path = require('path');
var Promise = require('bluebird');
var nodemailer = require('nodemailer');
var templateBuilder = require(path.join(__dirname, 'template-builder'));

var options;
var transporter = {};
var emailerConfig = {};

exports.register = function(server, opts, next) {
  options = opts = opts || {};
  if (!opts.config) { return next(new Error('No Config found in Emailer Plugin!')); }

  init();

  var emailer = { send, init };
  server.decorate('server', 'emailer', emailer);
  server.decorate('request', 'emailer', emailer);
  return next();
};

function init() {
  emailerConfig = options.config.emailer;
  transporter = nodemailer.createTransport({
    host: emailerConfig.host,
    port: emailerConfig.port,
    secure: emailerConfig.secure,
    auth: {
      user: emailerConfig.user,
      pass: emailerConfig.pass
    }
  });
}

function send(templateName, emailParams) {
  return new Promise(function(resolve, reject) {
    var emailTemplate = templateBuilder[templateName];
    if (!emailTemplate) { reject(new Error('Invalid email template: ' + templateName)); }
    var sender = emailerConfig.sender;
    var email = emailTemplate(sender, emailParams);
    transporter.sendMail(email, function(err) {
      if (err) { reject(new Error('Failed to Send Email (' + err.message + ')')); }
      else { resolve(); }
    });
  });
}

exports.register.attributes = {
  name: 'emailer',
  version: '1.0.0'
};
