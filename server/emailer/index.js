/* jshint node: true */
'use strict';

var path = require('path');
var Promise = require('bluebird');
var config = require(path.join(__dirname, '..', '..', 'config')).emailer;
var nodemailer = require('nodemailer');
var templateBuilder = require(path.join(__dirname, 'template-builder'));

var transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: config.secure,
  auth: {
    user: config.user,
    pass: config.pass
  }
});

exports.send = function(templateName, emailParams) {
  return new Promise(function(resolve, reject) {
    var emailTemplate = templateBuilder[templateName];
    if (!emailTemplate) { reject(new Error('Invalid email template: ' + templateName)); }
    var email = emailTemplate(emailParams);
    transporter.sendMail(email, function(err) {
      if (err) { reject(new Error('Failed to Send Email (' + err.message + ')')); }
      else { resolve(); }
    });
  });
};
