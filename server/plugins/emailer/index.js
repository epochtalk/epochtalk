var _ = require('lodash');
var path = require('path');
var Promise = require('bluebird');
var nodemailer = require('nodemailer');
var templateBuilder = require(path.join(__dirname, 'template-builder'));

var options;
var transporters = require(path.join(__dirname, 'transporters'));
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

// exposes this plugin as a javascript object
// used in cli
exports.expose = function(emailer) {
  options = {
    config: {
      emailer: emailer
    }
  };

  init();
  return { send, init };
};

function init() {
  emailerConfig = options.config.emailer;
  if (_.isUndefined(emailerConfig) || !_.get(emailerConfig, 'sender')) {
    transporter = {
      sendMail: function(email, callback) {
        console.log(email);
        callback();
      }
    };
  }
  else if (emailerConfig.transporter) {
    transporter = nodemailer.createTransport(transporters[emailerConfig.transporter](emailerConfig.options));
  }
  else {
    transporter = nodemailer.createTransport(emailerConfig.options);
  }
}

function send(templateName, emailParams) {
  return new Promise(function(resolve, reject) {
    var emailTemplate = templateBuilder[templateName];
    if (!emailTemplate) { reject(new Error('Invalid email template: ' + templateName)); }
    var sender;
    if (_.isUndefined(emailerConfig)) {
      sender = 'localhost';
    }
    else {
      sender = emailerConfig.sender;
    }
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
