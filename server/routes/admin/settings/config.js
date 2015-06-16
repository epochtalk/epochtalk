var fs = require('fs');
var Joi = require('joi');
var path = require('path');
var _ = require('lodash');
var renameKeys = require('deep-rename-keys');
var commonPre = require(path.normalize(__dirname + '/../../common')).auth;
var config = require(path.normalize(__dirname + '/../../../../config'));

var writeConfigToEnv = function(updatedConfig) {
  var stream = fs.createWriteStream(path.normalize(config.root + '/.env'));
  stream.once('open', function() {
    var configToEnv = function(oldConfig, newConfig, parentKey) {
      // Iterate over all config values and update if present
      _.map(oldConfig, function(value, key) {
        var environmentKey = parentKey ? parentKey + '_' + key : key;
        // Updated config uses underscores not camelcase
        var underscoredKey = key.split(/(?=[A-Z])/).join('_').toLowerCase();
        // Value is an object recurse
        if (_.isObject(value) && !_.isArray(value)) {
          var nestedConf = newConfig ? newConfig[underscoredKey] : undefined;
          configToEnv(value, nestedConf, environmentKey);
        }
        else {
          // special cases, these configs cannot be set via env vars
          if (environmentKey === 'root' || parentKey === 'db') { return; }
          // update value for this setting if it changed
          var newValue = newConfig ? newConfig[underscoredKey] : undefined;
          value = newValue === undefined ? value : newValue;
          // Detect camel case and replace with underscore and then uppercase
          environmentKey = environmentKey.split(/(?=[A-Z])/).join('_').toUpperCase();
          // Write env key and value to .env file
          stream.write(environmentKey + '=' + value + '\n');
          // Set the env var for the running node process
          process.env[environmentKey] = value;
          // Update the config object
          oldConfig[key] = value;
        }
      });
    };
    configToEnv(config, updatedConfig);
    stream.end();
  });
};

var camelCaseToUnderscore = function(obj) {
  if (_.isObject(obj)) {
    return renameKeys(obj, function(key) {
      return key.split(/(?=[A-Z])/).join('_').toLowerCase();
    });
  }
  return obj;
};

exports.find = {
  auth: { mode: 'required', strategy: 'jwt' },
  pre: [ { method: commonPre.adminCheck } ],
  handler: function(request, reply) {
    reply(camelCaseToUnderscore(config));
  }
};

exports.update = {
  auth: { mode: 'required', strategy: 'jwt' },
  pre: [ { method: commonPre.adminCheck } ],
  validate: {
    payload: Joi.object().keys({
      root: Joi.string(),
      host: Joi.string(),
      port: Joi.number(),
      log_enabled: Joi.boolean(),
      public_url: Joi.string(),
      private_key: Joi.string(),
      verify_registration: Joi.boolean(),
      login_required: Joi.boolean(),
      website: Joi.object().keys({
        title: Joi.string(),
        description: Joi.string(),
        keywords: Joi.string(),
        logo: Joi.string().allow(''),
        favicon: Joi.string().allow('')
      }),
      emailer: Joi.object().keys({
        sender: Joi.string(),
        host: Joi.string(),
        port: Joi.number(),
        user: Joi.string(),
        pass: Joi.string(),
        secure: Joi.boolean()
      }),
      images: Joi.object().keys({
        storage: Joi.string(),
        max_size: Joi.number(),
        expiration: Joi.number(),
        interval: Joi.number(),
        local: Joi.object().keys({
          dir: Joi.string(),
          path: Joi.string()
        }),
        s3: Joi.object().keys({
          root: Joi.string(),
          dir: Joi.string(),
          bucket: Joi.string(),
          region: Joi.string(),
          access_key: Joi.string(),
          secret_key: Joi.string()
        })
      })
    }).options({ stripUnknown: false, abortEarly: true })
  },
  handler: function(request, reply) {
    var newConfig = request.payload;
    writeConfigToEnv(newConfig);
    reply(request.payload);
  }
};
