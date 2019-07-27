var Joi = require('joi');
var changeCase = require('change-case');
var renameKeys = require('deep-rename-keys');
var _ = require('lodash');
var Boom = require('boom');
var Promise = require('bluebird');
var ConfigError = Promise.OperationalError;

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {POST} /api/configurations(Admin) Update
  * @apiName UpdateSettings
  * @apiDescription Used to update web app settings. Used in the admin panel.
  *
  * @apiParam (Payload) {boolean} [verify_registration] Boolean indicating if users need verify their accounts via email
  * @apiParam (Payload) {boolean} [login_required] Boolean indicating if users need to login to view posts
  * @apiParam (Payload) {boolean} [invite_only] Boolean indicating if forum is invite only
  * @apiParam (Payload) {string} [ga_key] Google analytics key for reCaptcha
  * @apiParam (Payload) {object} [website] Object containing website configs
  * @apiParam (Payload) {string} [website.title] The title of the website
  * @apiParam (Payload) {string} [website.description] Website description text
  * @apiParam (Payload) {string} [website.keywords] Website keywords
  * @apiParam (Payload) {string} [website.logo] The logo for the website
  * @apiParam (Payload) {string} [website.favicon] The favicon for the website
  * @apiParam (Payload) {object} [emailer] Object containing configurations for the email server
  * @apiParam (Payload) {string} [emailer.sender] Email address that emails will be sent from
  * @apiParam (Payload) {string} [emailer.options.host] The SMTP host
  * @apiParam (Payload) {number} [emailer.options.port] The SMTP port
  * @apiParam (Payload) {string} [emailer.options.auth.user] The SMTP username
  * @apiParam (Payload) {string} [emailer.options.auth.pass] The SMTP password
  * @apiParam (Payload) {boolean} [emailer.options.secure] Boolean indicating whether or not to use SSL
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
  * @apiParam (Payload) {object} [rate_limiting] Object containing rate limit configurations
  * @apiParam (Payload) {object} [rate_limiting.get] Object containing GET rate limit configurations
  * @apiParam (Payload) {number{-1...n}} [rate_limiting.get.interval] The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiParam (Payload) {number{1...n}} [rate_limiting.get.max_in_interval] How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiParam (Payload) {number} [rate_limiting.get.min_difference] How long between each request (e.g. how much time between each MAX_IN_INTERVAL)
  * @apiParam (Payload) {number{-1...n}} [rate_limiting.post.interval] The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiParam (Payload) {number{1...n}} [rate_limiting.post.max_in_interval] How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiParam (Payload) {number} [rate_limiting.post.min_difference] How long between each request (e.g. how much time between each MAX_IN_INTERVAL)
  * @apiParam (Payload) {number{-1...n}} [rate_limiting.put.interval] The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiParam (Payload) {number{1...n}} [rate_limiting.put.max_in_interval] How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiParam (Payload) {number} [rate_limiting.put.min_difference] How long between each request (e.g. how much time between each MAX_IN_INTERVAL)
  * @apiParam (Payload) {number{-1...n}} [rate_limiting.delete.interval] The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiParam (Payload) {number{1...n}} [rate_limiting.delete.max_in_interval] How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiParam (Payload) {number} [rate_limiting.delete.min_difference] How long between each request (e.g. how much time between each MAX_IN_INTERVAL)
  *
  * @apiSuccess {object} config Same object that was passed in is returned upon success
  */
module.exports = {
  method: 'POST',
  path: '/api/configurations',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: { type: 'adminSettings.update' }
    },
    validate: {
      payload: Joi.object().keys({
        verify_registration: Joi.boolean(),
        login_required: Joi.boolean(),
        post_max_length: Joi.number().min(100).max(25000).required(),
        invite_only: Joi.boolean(),
        ga_key: Joi.string().allow(''),
        website: Joi.object().keys({
          title: Joi.string(),
          description: Joi.string(),
          keywords: Joi.string(),
          logo: Joi.string().allow(''),
          favicon: Joi.string().allow(''),
          default_avatar: Joi.string().allow(''),
        }),
        emailer: Joi.object().keys({
          sender: Joi.string().allow(null),
          secure: Joi.boolean(),
          options: Joi.object().keys({
            host: Joi.string().allow(null),
            port: Joi.number().allow(null),
            auth: Joi.object().keys({
              user: Joi.string(),
              pass: Joi.string()
            })
          })
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
          s_3: Joi.object().keys({
            root: Joi.string(),
            dir: Joi.string(),
            bucket: Joi.string(),
            region: Joi.string(),
            access_key: Joi.string().allow(''),
            secret_key: Joi.string().allow('')
          })
        }),
        rate_limiting: Joi.object().keys({
          get: {
            interval: Joi.number().min(-1),
            max_in_interval: Joi.number().min(1),
            min_difference: Joi.number()
          },
          post: {
            interval: Joi.number().min(-1),
            max_in_interval: Joi.number().min(1),
            min_difference: Joi.number()
          },
          put: {
            interval: Joi.number().min(-1),
            max_in_interval: Joi.number().min(1),
            min_difference: Joi.number()
          },
          delete: {
            interval: Joi.number().min(-1),
            max_in_interval: Joi.number().min(1),
            min_difference: Joi.number()
          }
        }),
        portal: Joi.object().keys({
          enabled: Joi.boolean().default(false),
          board_id: Joi.string().allow('').allow(null)
        })
      }).options({ stripUnknown: true, abortEarly: true })
    },
    pre: [
      { method: (request) => request.server.methods.auth.configurations.update(request.server, request.auth) },
      { method: validatePortalParams },
      { method: (request) => request.server.methods.common.images.saveNoExpiration(request.payload.website.logo) },
      { method: (request) => request.server.methods.common.images.saveNoExpiration(request.payload.website.favicon) }
    ]
  },
  handler: function(request, reply) {
    var internalConfig = request.server.app.config;
    var newConfig = underscoreToCamelCase(request.payload);
    var promise = sanitizeConfigs(newConfig, internalConfig.saasMode)
    .then(function(sanitizedConfig) {
      newConfig = sanitizedConfig;
      return request.db.configurations.update(sanitizedConfig)
      .then(function() {
        Object.keys(sanitizedConfig).forEach(function(key) {
          if ((key === 'emailer' || key === 'images') && internalConfig.saasMode) { return; }
          internalConfig[key] = sanitizedConfig[key];
        });
      });
    })
    // update rate default rate limits
    .then(function() {
      var updateLimits = request.server.plugins['rate-limiter'].updateLimits;
      updateLimits(newConfig.rateLimiting);
    })
    // re-init image clients
    .then(function() { request.imageStore.reinit(); })
    // re-init emailer
    .then(function() { request.emailer.init(); })
    // return payload
    .then(function() { return request.payload; })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};

function validatePortalParams(request) {
  // validate portal params
  if (request.payload.portal &&
      request.payload.portal.enabled &&
      !request.payload.portal.board_id) {
    return Boom.badData('Portal Configurations must include a Board to Show');
  }
  else { return true; }
}

function underscoreToCamelCase(obj) {
  if (_.isObject(obj)) {
    return renameKeys(obj, function(key) {
      return changeCase.camel(key);
    });
  }
  return obj;
}

function sanitizeConfigs(configurations, saasMode) {
  // skip sanitization if in saas mode
  if (saasMode) { return Promise.resolve(configurations); }

  var config = {};

  return new Promise(function(resolve) {
    Object.keys(configurations).forEach(function(key) {
      config[key] = configurations[key];
    });

    // parse images local dir
    var localDir = config.images.local.dir;
    if (localDir.indexOf('/') !== 0) {
      config.images.local.dir = '/' + localDir;
      localDir =  '/' + localDir;
    }
    if (localDir.indexOf('/', localDir.length-1) === -1) {
      config.images.local.dir = localDir + '/';
    }
    // parse images public dir
    var localPath = config.images.local.path;
    if (localPath.indexOf('/') !== 0) {
      config.images.local.path = '/' + localPath;
      localPath = '/' + localPath;
    }
    if (localPath.indexOf('/', localPath.length-1) === -1) {
      config.images.local.path = localPath + '/';
    }

    // parse images root and dir
    var s3root = config.images.s3.root;
    if (s3root.indexOf('/', s3root.length-1) === -1) {
      config.images.s3.root = s3root + '/';
    }
    var s3dir = config.images.s3.dir;
    if (s3dir.indexOf('/', s3dir.length-1) === -1) {
      s3dir += '/';
      config.images.s3.dir = s3dir;
    }
    if (s3dir.indexOf('/') === 0) {
      config.images.s3.dir = s3dir.substring(1);
    }

    return resolve();
  })
  .then(function() {
    return checkImagesConfig(config.images);
  })
  .then(function() { return config; });
}

function checkImagesConfig(images) {
  return new Promise(function(resolve, reject) {
    if (!images) { return reject(new ConfigError('Images configuration not found')); }

    var errors = [];
    var storageType = images.storage;

    if (!storageType) { errors.push('Image Storage Type not found.'); }
    else if (storageType !== 'local' && storageType !== 's3') {
      errors.push('Image Type is not "local" or "s3"');
    }
    if (!images.maxSize) { errors.push('Max Image Size not set.'); }
    if (!images.expiration) { errors.push('Image Expiration Interval not set.'); }
    if (!images.interval) { errors.push('Image Check Interval not set.'); }

    // local
    if (storageType === 'local') {
      if (!images.local.dir) { errors.push('Local Images dir not set.'); }
      if (!images.local.path) { errors.push('Local Images public path not set.'); }
    }

    // s3
    if (storageType === 's3') {
      if (!images.s3.root) { errors.push('S3 root URL not set.'); }
      if (!images.s3.dir) { errors.push('S3 dir not set.'); }
      if (!images.s3.bucket) { errors.push('S3 bucket not set.'); }
      if (!images.s3.region) { errors.push('S3 region not set.'); }
      if (!images.s3.accessKey) { errors.push('S3 Access Key not set.'); }
      if (!images.s3.secretKey) { errors.push('S3 Secret Key not set.'); }
    }

    if (errors.length > 0) { return reject(new ConfigError(errors.join('\n'))); }
    else { return resolve(); }
  });
}
