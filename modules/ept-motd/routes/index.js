var Joi = require('joi');
var fse = require('fs-extra');
var Promise = require('bluebird');
var path = require('path');
var motdPath = path.normalize(__dirname + '/../../../content/motd/motd.txt');


var get = {
  method: 'GET',
  path: '/api/motd',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
  },
  handler: function(request, reply) {
    var getFile = function(dir) {
      return new Promise(function(resolve) {
        fse.stat(dir, function() {
          return resolve(fse.readFileSync(dir, 'utf8'));
        });
      });
    };
    var promise = getFile(motdPath)
    .then(function(motd) {
      return {
        motd: motd,
        motd_html: request.parser.parse(motd)
      };
    })
    .error(request.errorMap.toHttpError);
    return reply(promise);
  }
};

var save = {
  method: 'PUT',
  path: '/api/motd',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { payload: { motd: Joi.string().allow('') } }
  },
  handler: function(request, reply) {
    var writeFile = function(path, text) {
      return new Promise(function(resolve, reject) {
        fse.outputFile(path, text, function(err) {
          if (err) { return reject(err); }
          else { return resolve(); }
        });
      });
    };
    var motd = request.payload.motd;
    var promise =  writeFile(motdPath, motd)
    .then(function() {
      return {
        motd: motd,
        motd_html: request.parser.parse(motd)
      };
    });
    return reply(promise);
  }
};

module.exports = [ get, save ];
