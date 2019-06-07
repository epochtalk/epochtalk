var _ = require('lodash');
var changeCase = require('change-case');
var renameKeys = require('deep-rename-keys');

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {GET} /admin/settings (Admin) Find
  * @apiName FindSettings
  * @apiDescription Used to fetch all web app settings. Allows admins to grab settings defined
  * in config.js
  *
  * @apiSuccess {boolean} verify_registration Boolean indicating if users need verify their accounts via email
  * @apiSuccess {boolean} login_required Boolean indicating if users need to login to view posts
  * @apiSuccess {boolean} invite_only Boolean indicating if forum is invite only
  * @apiSuccess {boolean} saas_mode Boolean indicating if forum is in saas mode
  * @apiSuccess {string} ga_key Google analytics key for reCaptcha
  * @apiSuccess {object} website Object containing website configs
  * @apiSuccess {string} website.title The title of the website
  * @apiSuccess {string} website.description Website description text
  * @apiSuccess {string} website.keywords Website keywords
  * @apiSuccess {string} website.logo The logo for the website
  * @apiSuccess {string} website.favicon The favicon for the website
  * @apiSuccess {object} emailer Object containing configurations for the email server
  * @apiSuccess {string} emailer.sender Email address that emails will be sent from
  * @apiSuccess {string} emailer.options.host The SMTP host
  * @apiSuccess {number} emailer.options.port The SMTP port
  * @apiSuccess {string} emailer.options.auth.user The SMTP username
  * @apiSuccess {string} emailer.options.auth.pass The SMTP password
  * @apiSuccess {boolean} emailer.options.secure Boolean indicating whether or not to use SSL
  * @apiSuccess {object} images Object containing image server configurations
  * @apiSuccess {string="local","s3"} images.storage Where to store images
  * @apiSuccess {number} images.max_size Max image file size
  * @apiSuccess {number} images.expiration Expiration time for unused images
  * @apiSuccess {number} images.interval Interval for checking for unused images
  * @apiSuccess {object} images.local Object containing local image server configurations
  * @apiSuccess {string} images.local.dir Path to directory to store uploaded images
  * @apiSuccess {string} images.local.path Path to relative to host of where to serve images
  * @apiSuccess {object} images.s3 Object containing s3 image server configurations
  * @apiSuccess {string} images.s3.root The s3 root url
  * @apiSuccess {string} images.s3.dir The s3 directory
  * @apiSuccess {string} images.s3.bucket The s3 bucket
  * @apiSuccess {string} images.s3.region The s3 region
  * @apiSuccess {string} images.s3.access_key The s3 access key
  * @apiSuccess {string} images.s3.secret_key The s3 secret key
  * @apiSuccess {object} rate_limiting Object containing rate limit configurations
  * @apiSuccess {string} rate_limiting.namespace Redis namespace prefix for rate limit configurations
  * @apiSuccess {object} rate_limiting.get Object containing GET rate limit configurations
  * @apiSuccess {number{-1...n}} rate_limiting.get.interval The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiSuccess {number{1...n}} rate_limiting.get.max_in_interval How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiSuccess {number} rate_limiting.get.min_difference How long between each request (e.g. how much time between each MAX_IN_INTERVAL)
  * @apiSuccess {number{-1...n}} rate_limiting.post.interval The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiSuccess {number{1...n}} rate_limiting.post.max_in_interval How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiSuccess {number} rate_limiting.post.min_difference How long between each request (e.g. how much time between each MAX_IN_INTERVAL)
  * @apiSuccess {number{-1...n}} rate_limiting.put.interval The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiSuccess {number{1...n}} rate_limiting.put.max_in_interval How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiSuccess {number} rate_limiting.put.min_difference How long between each request (e.g. how much time between each MAX_IN_INTERVAL)
  * @apiSuccess {number{-1...n}} rate_limiting.delete.interval The amount of time to which you are limiting the number of request to (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiSuccess {number{1...n}} rate_limiting.delete.max_in_interval How many requests you can make within the interval (e.g. MAX_IN_INTERVAL requests every INTERVAL)
  * @apiSuccess {number} rate_limiting.delete.min_difference How long between each request (e.g. how much time between each MAX_IN_INTERVAL)
  */
module.exports = {
  method: 'GET',
  path: '/api/admin/settings',
  config: {
    auth: { strategy: 'jwt' },
    pre: [ { method: 'auth.configurations.get(server, auth)' } ]
  },
  handler: function(request, reply) {
    var promise = request.db.configurations.get()
    .then(function(config) {
       var retVal = {
         loginRequired: config.loginRequired,
         verifyRegistration: config.verifyRegistration,
         postMaxLength: config.postMaxLength || 10000,
         inviteOnly: config.inviteOnly,
         gaKey: config.gaKey || '',
         website: config.website,
         portal: config.portal,
         emailer: config.saasMode ? {} : config.emailer,
         images: config.saasMode ? {local:{}, s_3:{}} : config.images,
         rateLimiting: config.rateLimiting,
         saasMode: config.saasMode
       };
       retVal = camelCaseToUnderscore(retVal);

       return retVal;
    });

    return reply(promise);
  }
};

function camelCaseToUnderscore(obj) {
  if (_.isObject(obj)) {
    return renameKeys(obj, function(key) {
      return changeCase.snake(key);
    });
  }
  return obj;
};
