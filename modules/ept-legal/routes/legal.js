var path = require('path');
var Promise = require('bluebird');
var fse = require('fs-extra');

module.exports = {
  method: 'GET',
  path: '/legal',
  handler: function(request, reply) {
    var config = request.server.app.config;
    var baseCustomPath = __dirname + '/../../../content/legal/';
    var baseDefaultPath = __dirname + '/../../../defaults/legal/';

    var getFile = function(customDir, defaultDir) {
      return new Promise(function(resolve) {
        fse.stat(customDir, function(err, stat) {
          var readDir;
          if (!err && stat.isFile()) { readDir = customDir; }
          else { readDir = defaultDir; }
          return resolve(fse.readFileSync(readDir, 'utf8'));
        });
      });
    };

    var tosCustomDir = path.normalize(baseCustomPath + 'tos.txt');
    var tosDefaultDir = path.normalize(baseDefaultPath + 'tos.txt');
    var getTos = getFile(tosCustomDir, tosDefaultDir);

    var privacyCustomDir = path.normalize(baseCustomPath + 'privacy.txt');
    var privacyDefaultDir = path.normalize(baseDefaultPath + 'privacy.txt');
    var getPrivacy = getFile(privacyCustomDir, privacyDefaultDir);

    var disclaimerCustomDir = path.normalize(baseCustomPath + 'disclaimer.txt');
    var disclaimerDefaultDir = path.normalize(baseDefaultPath + 'disclaimer.txt');
    var getDisclaimer = getFile(disclaimerCustomDir, disclaimerDefaultDir);

    return Promise.join(getTos, getPrivacy, getDisclaimer, function(tos, privacy, disclaimer) {
      var data = {
        title: config.website.title,
        description: config.website.description,
        keywords: config.website.keywords,
        logo: config.website.logo,
        favicon: config.website.favicon,
        GAKey: config.gaKey,
        tos: tos,
        privacy: privacy,
        disclaimer: disclaimer
      };

      return reply.view('legal', data);
    });
  }
};
