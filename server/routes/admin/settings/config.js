var fs = require('fs');
var Joi = require('joi');
var path = require('path');
var _ = require('lodash');
var renameKeys = require('deep-rename-keys');
var changeCase = require('change-case');
var pre = require(path.normalize(__dirname + '/pre'));
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
var db = require(path.normalize(__dirname + '/../../../../db'));

var camelCaseToUnderscore = function(obj) {
  if (_.isObject(obj)) {
    return renameKeys(obj, function(key) {
      return changeCase.snake(key);
    });
  }
  return obj;
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Settings
  * @api {GET} /admin/settings (Admin) Find
  * @apiName FindSettings
  * @apiDescription Used to fetch all web app settings. Allows admins to grab settings defined
  * in config.js
  *
  * @apiSuccess {object} config See config.js in the root of the project
  */
exports.find = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminSettings.find' },
  handler: function(request, reply) {
    db.configurations.get().then(function(configs) {
      reply(camelCaseToUnderscore(configs));
    });
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Settings
  * @api {POST} /admin/settings (Admin) Update
  * @apiName UpdateSettings
  * @apiDescription Used to update web app settings. Used in the admin panel.
  *
  * @apiParam (Payload) {string} [root] Path to the root directory of the project
  * @apiParam (Payload) {string} [host] The host address that the web app is running on
  * @apiParam (Payload) {number} [port] The port the web app is running on
  * @apiParam (Payload) {boolean} [log_enabled] Boolean indicating if the server should log to /logs
  * @apiParam (Payload) {string} [public_url] The public facing URL to access the web app
  * @apiParam (Payload) {string} [private_key] The private key for the web app
  * @apiParam (Payload) {boolean} [verify_registration] Boolean indicating if users need verify their accounts via email
  * @apiParam (Payload) {boolean} [login_required] Boolean indicating if users need to login to view posts
  * @apiParam (Payload) {object} [website] Object containing website configs
  * @apiParam (Payload) {string} [website.title] The title of the website
  * @apiParam (Payload) {string} [website.description] Website description text
  * @apiParam (Payload) {string} [website.keywords] Website keywords
  * @apiParam (Payload) {string} [website.logo] The logo for the website
  * @apiParam (Payload) {string} [website.favicon] The favicon for the website
  * @apiParam (Payload) {object} [emailer] Object containing configurations for the email server
  * @apiParam (Payload) {string} [emailer.sender] Email address that emails will be sent from
  * @apiParam (Payload) {string} [emailer.host] The SMTP host
  * @apiParam (Payload) {number} [emailer.port] The SMTP port
  * @apiParam (Payload) {string} [emailer.user] The SMTP username
  * @apiParam (Payload) {string} [emailer.pass] The SMTP password
  * @apiParam (Payload) {boolean} [emailer.secure] Boolean indicating whether or not to use SSL
  * @apiParam (Payload) {object} [images] Object containing image server configurations
  * @apiParam (Payload) {string="local","s3"} [images.storage] Where to store images
  * @apiParam (Payload) {number} [images.max_size] Max image file size
  * @apiParam (Payload) {number} [images.expiration] Expiration time for unused images
  * @apiParam (Payload) {number} [images.interval] Interval for checking for unused images
  * @apiParam (Payload) {object} [images.local] Object containing local image server configurations
  * @apiParam (Payload) {string} [images.local.dir] Path to directory to store uploaded images
  * @apiParam (Payload) {string} [images.local.path] Path to relative to host of where to serve images
  * @apiParam (Payload) {object} [images.s3] Object containing s3 image server configurations
  * @apiParam (Payload) {string} [images.s3.root] The s3 root url
  * @apiParam (Payload) {string} [images.s3.dir] The s3 directory
  * @apiParam (Payload) {string} [images.s3.bucket] The s3 bucket
  * @apiParam (Payload) {string} [images.s3.region] The s3 region
  * @apiParam (Payload) {string} [images.s3.access_key] The s3 access key
  * @apiParam (Payload) {string} [images.s3.secret_key] The s3 secret key
  *
  * @apiSuccess {object} config Same object that was passed in is returned upon success
  */
exports.update = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminSettings.update' },
  pre: [ { method: pre.handleImages } ],
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
      redis: Joi.object().keys({
        host: Joi.string(),
        port: Joi.number()
      }),
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
