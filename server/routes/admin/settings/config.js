var fs = require('fs');
var _ = require('lodash');
var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var Promise = require('bluebird');
var readLine = require('readline');
var changeCase = require('change-case');
var renameKeys = require('deep-rename-keys');
var sass = require(path.join(__dirname + '/../../../../scripts', 'tasks', 'sass'));
var copyCss = require(path.join(__dirname + '/../../../../scripts', 'tasks', 'copy_files'));
var varsDir = '/../../../../app/scss/ept/variables';
var previewVarsPath = path.normalize(__dirname + varsDir + '/_preview-variables.scss');
var defaultVarsPath = path.normalize(__dirname + varsDir + '/_default-variables.scss');
var customPath = '/../../../../content/sass/_custom-variables.scss';
var customVarsPath = path.normalize(__dirname + customPath);


var camelCaseToUnderscore = function(obj) {
  if (_.isObject(obj)) {
    return renameKeys(obj, function(key) {
      return changeCase.snake(key);
    });
  }
  return obj;
};
var underscoreToCamelCase = function(obj) {
  if (_.isObject(obj)) {
    return renameKeys(obj, function(key) {
      return changeCase.camel(key);
    });
  }
  return obj;
};

function validatePortalParams(request, reply) {
  // validate portal params
  if (request.payload.portal &&
      request.payload.portal.enabled &&
      !request.payload.portal.board_id) {
    return reply(Boom.badData('Portal Configurations must include a Board to Show'));
  }
  else { return reply(); }
}

/**
  * @apiVersion 0.4.0
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
    var config = request.server.app.config;
    var retVal = {
      logEnabled: config.logEnabled,
      loginRequired: config.loginRequired,
      verifyRegistration: config.verifyRegistration,
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

    return reply(retVal);
  }
};

/**
  * @apiVersion 0.4.0
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
  plugins: {
    acls: 'adminSettings.update',
    mod_log: { type: 'adminSettings.update' }
  },
  pre: [
    { method: validatePortalParams },
    { method: 'common.images.site(imageStore, payload)' }
  ],
  validate: {
    payload: Joi.object().keys({
      log_enabled: Joi.boolean(),
      verify_registration: Joi.boolean(),
      login_required: Joi.boolean(),
      invite_only: Joi.boolean(),
      ga_key: Joi.string().allow(''),
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
        board_id: Joi.string().allow('').default(null)
      })
    }).options({ stripUnknown: true, abortEarly: true })
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
    .then(function() { return request.payload; });

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {GET} /admin/settings/blacklist (Admin) Get Blacklist
  * @apiName GetBlacklist
  * @apiDescription Used to fetch the IP blacklist
  *
  * @apiSuccess {object[]} blacklist Array containing blacklisted IPs and info
  * @apiSuccess {string} blacklist.note A note/name for the Blacklisted IP rule.
  * @apiSuccess {string} blacklist.ip_data A single ip, ip range or wildcard ip.
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the blacklist.
  */
exports.getBlacklist = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminSettings.getBlacklist' },
  handler: function(request, reply) {
    var promise = request.db.blacklist.all();
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {POST} /admin/settings/blacklist (Admin) Add IP Rule to Blacklist
  * @apiName AddToBlacklist
  * @apiDescription Used to add an IP Rule to the blacklist
  *
  * @apiSuccess {object[]} blacklist Array containing blacklisted IPs and info
  * @apiSuccess {string} blacklist.note A note/name for the Blacklisted IP rule.
  * @apiSuccess {string} blacklist.ip_data A single ip, ip range or wildcard ip.
  *
  * @apiError (Error 500) InternalServerError There was an issue adding to the blacklist.
  */
exports.addToBlacklist = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminSettings.addToBlacklist',
    mod_log: {
      type: 'adminSettings.addToBlacklist',
      data: {
        ip_data: 'payload.ip_data',
        note: 'payload.note'
      }
    }
  },
  validate: {
    payload: {
      ip_data: Joi.string().min(1).max(100),
      note: Joi.string().min(1).max(255)
    }
  },
  handler: function(request, reply) {
    var rule = request.payload;
    var promise = request.db.blacklist.addRule(rule)
    .then(function(blacklist) {
      request.server.plugins.blacklist.retrieveBlacklist();
      return blacklist;
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {PUT} /admin/settings/blacklist (Admin) Update existing IP Rule in Blacklist
  * @apiName UpdateBlacklist
  * @apiDescription Used to update an existing IP Rule in the blacklist
  *
  * @apiSuccess {object[]} blacklist Array containing blacklisted IPs and info
  * @apiSuccess {string} blacklist.note A note/name for the Blacklisted IP rule.
  * @apiSuccess {string} blacklist.ip_data A single ip, ip range or wildcard ip.
  *
  * @apiError (Error 500) InternalServerError There was an issue updating the blacklist.
  */
exports.updateBlacklist = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminSettings.updateBlacklist',
    mod_log: {
      type: 'adminSettings.updateBlacklist',
      data: {
        id: 'payload.id',
        ip_data: 'payload.ip_data',
        note: 'payload.note'
      }
    }
  },
  validate: {
    payload: {
      id: Joi.string().required(),
      ip_data: Joi.string().min(1).max(100),
      note: Joi.string().min(1).max(255)
    }
  },
  handler: function(request, reply) {
    var updatedRule = request.payload;
    var promise = request.db.blacklist.updateRule(updatedRule)
    .then(function(blacklist) {
      request.server.plugins.blacklist.retrieveBlacklist();
      return blacklist;
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {DELETE} /admin/settings/blacklist/:id (Admin) Delete existing IP Rule from Blacklist
  * @apiName DeleteBlacklist
  * @apiDescription Used to update an existing IP Rule in the blacklist
  *
  * @apiParam {string} id The id of the blacklist rule to delete
  *
  * @apiSuccess {object[]} blacklist Array containing blacklisted IPs and info
  * @apiSuccess {string} blacklist.note A note/name for the Blacklisted IP rule.
  * @apiSuccess {string} blacklist.ip_data A single ip, ip range or wildcard ip.
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting from the blacklist.
  */
exports.deleteFromBlacklist = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminSettings.deleteFromBlacklist',
    mod_log: {
      type: 'adminSettings.deleteFromBlacklist',
      data: {
        note: 'route.settings.plugins.mod_log.metadata.note',
        ip_data: 'route.settings.plugins.mod_log.metadata.ip_data'
      }
    }
  },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    var id = request.params.id;
    var promise = request.db.blacklist.deleteRule(id)
    .then(function(results) {
      // Assign deleted obj info to plugin metadata
      request.route.settings.plugins.mod_log.metadata = {
        note: results.rule.note,
        ip_data: results.rule.ip_data
      };

      request.server.plugins.blacklist.retrieveBlacklist();
      return results.blacklist;
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {GET} /admin/settings/theme (Admin) Get Theme
  * @apiName GetTheme
  * @apiDescription Used to fetch theme vars in _custom-variables.scss
  *
  * @apiSuccess {object} theme Object containing theme vars and values
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the theme.
  */
exports.getTheme = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminSettings.getTheme' },
  validate: { query: { preview: Joi.boolean() } },
  handler: function(request, reply) {
    var preview = request.query.preview;
    var previewExists = fs.statSync(previewVarsPath).size;
    var readFilePath = preview && previewExists ? previewVarsPath : customVarsPath;
    var rl = readLine.createInterface({
      input: fs.createReadStream(readFilePath),
      terminal: false
    });
    var theme = {};
    rl.on('line', function (line) {
      if (line.charAt(0) === '$') {
        var lineArr = line.split(':');
        var key = lineArr[0].split('$')[1].trim();
        var val = lineArr[1].split(';')[0].trim();
        theme[key] = val;
      }
    })
    .on('close', function() { reply(theme); });
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {PUT} /admin/settings/theme (Admin) Set Theme
  * @apiName SetTheme
  * @apiDescription Used to set theme vars in _custom-variables.scss
  *
  * @apiParam (Payload) {string} base-line-height Base line height for entire forum
  * @apiParam (Payload) {string} base-background-color The background color for the entire forum
  * @apiParam (Payload) {string} color-primary The primary color for the forum, used for buttons, etc...
  * @apiParam (Payload) {string} base-font-sans Font family for the entire forum
  * @apiParam (Payload) {string} base-font-color Base font color for entire forum
  * @apiParam (Payload) {string} base-font-size Base font size for entire forum
  * @apiParam (Payload) {string} secondary-font-color Secondary font color, used for description text
  * @apiParam (Payload) {string} input-font-color Font color for input fields
  * @apiParam (Payload) {string} input-background-color Background color for all input fields
  * @apiParam (Payload) {string} border-color Color for all borders used in the forum
  * @apiParam (Payload) {string} header-bg-color Color for the forum header background
  * @apiParam (Payload) {string} header-font-color Font color for the forum header
  * @apiParam (Payload) {string} sub-header-color Color for sub headers and footers
  *
  * @apiSuccess {object} theme Object containing theme vars and values
  * @apiSuccess {string} theme.base-line-height Base line height for entire forum
  * @apiSuccess {string} theme.base-background-color The background color for the entire forum
  * @apiSuccess {string} theme.color-primary The primary color for the forum, used for buttons, etc...
  * @apiSuccess {string} theme.base-font-sans Font family for the entire forum
  * @apiSuccess {string} theme.base-font-color Base font color for entire forum
  * @apiSuccess {string} theme.base-font-size Base font size for entire forum
  * @apiSuccess {string} theme.secondary-font-color Secondary font color, used for description text
  * @apiSuccess {string} theme.input-font-color Font color for input fields
  * @apiSuccess {string} theme.input-background-color Background color for all input fields
  * @apiSuccess {string} theme.border-color Color for all borders used in the forum
  * @apiSuccess {string} theme.header-bg-color Color for the forum header background
  * @apiSuccess {string} theme.header-font-color Font color for the forum header
  * @apiSuccess {string} theme.sub-header-color Color for sub headers and footers
  *
  * @apiError (Error 500) InternalServerError There was an issue setting the theme.
  */
exports.setTheme = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminSettings.setTheme',
    mod_log: {
      type: 'adminSettings.setTheme',
      data: { theme: 'payload' }
    }
  },
  validate: {
    payload: Joi.object().keys({
      'base-line-height': Joi.string(),
      'base-background-color': Joi.string(),
      'color-primary': Joi.string(),
      'base-font-sans': Joi.string(),
      'base-font-color': Joi.string(),
      'base-font-size': Joi.string(),
      'secondary-font-color': Joi.string(),
      'input-font-color': Joi.string(),
      'input-background-color': Joi.string(),
      'border-color': Joi.string(),
      'header-font-color': Joi.string(),
      'sub-header-color': Joi.string(),
      'header-bg-color': Joi.string()
    })
  },
  handler: function(request, reply) {
    var theme = request.payload;
    var keys = Object.keys(theme);
    var stream = fs.createWriteStream(customVarsPath);
    stream.once('open', function() {
      keys.forEach(function(key) {
        stream.write('$' + key + ': ' + theme[key].toLowerCase() + ';\n');
      });
      stream.end();
    })
    .on('close', function() {
      fs.truncateSync(previewVarsPath, 0); // wipe preview vars file
      copyCss()
      .then(sass)
      .then(function() { reply(theme); })
      .catch(function(err) {
        reply(Boom.badRequest(err));
      });
    });
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {POST} /admin/settings/theme (Admin) Reset Theme
  * @apiName ResetTheme
  * @apiDescription Used reset custom variables to fall back to _default-variables.scss
  *
  * @apiSuccess {object} theme Object containing theme vars and values
  * @apiSuccess {string} theme.base-line-height Base line height for entire forum
  * @apiSuccess {string} theme.base-background-color The background color for the entire forum
  * @apiSuccess {string} theme.color-primary The primary color for the forum, used for buttons, etc...
  * @apiSuccess {string} theme.base-font-sans Font family for the entire forum
  * @apiSuccess {string} theme.base-font-color Base font color for entire forum
  * @apiSuccess {string} theme.base-font-size Base font size for entire forum
  * @apiSuccess {string} theme.secondary-font-color Secondary font color, used for description text
  * @apiSuccess {string} theme.input-font-color Font color for input fields
  * @apiSuccess {string} theme.input-background-color Background color for all input fields
  * @apiSuccess {string} theme.border-color Color for all borders used in the forum
  * @apiSuccess {string} theme.header-bg-color Color for the forum header background
  * @apiSuccess {string} theme.header-font-color Font color for the forum header
  * @apiSuccess {string} theme.sub-header-color Color for sub headers and footers
  *
  * @apiError (Error 500) InternalServerError There was an issue resetting the theme.
  */
exports.resetTheme = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminSettings.resetTheme',
    mod_log: { type: 'adminSettings.resetTheme' }
  },
  handler: function(request, reply) {
    fs.truncateSync(previewVarsPath, 0); // wipe preview vars file
    return new Promise(function(resolve, reject) {
      var rd = fs.createReadStream(defaultVarsPath);
      rd.on('error', reject);
      var wr = fs.createWriteStream(customVarsPath);
      wr.on('error', reject);
      wr.on('finish', resolve);
      rd.pipe(wr);
    })
    .then(copyCss)
    .then(sass)
    .then(function() { // read theme from file and return vars in reply
      var rl = readLine.createInterface({
        input: fs.createReadStream(customVarsPath),
        terminal: false
      });
      var theme = {};
      rl.on('line', function (line) {
        if (line.charAt(0) === '$') {
          var lineArr = line.split(':');
          var key = lineArr[0].split('$')[1].trim();
          var val = lineArr[1].split(';')[0].trim();
          theme[key] = val;
        }
      })
      .on('close', function() { reply(theme); });
    })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {PUT} /admin/settings/theme/preview (Admin) Preview Theme
  * @apiName PreviewTheme
  * @apiDescription Used preview theme vars are compiled from _preview-variables.scss
  *
  * @apiParam (Payload) {string} base-line-height Base line height for entire forum
  * @apiParam (Payload) {string} base-background-color The background color for the entire forum
  * @apiParam (Payload) {string} color-primary The primary color for the forum, used for buttons, etc...
  * @apiParam (Payload) {string} base-font-sans Font family for the entire forum
  * @apiParam (Payload) {string} base-font-color Base font color for entire forum
  * @apiParam (Payload) {string} base-font-size Base font size for entire forum
  * @apiParam (Payload) {string} secondary-font-color Secondary font color, used for description text
  * @apiParam (Payload) {string} input-font-color Font color for input fields
  * @apiParam (Payload) {string} input-background-color Background color for all input fields
  * @apiParam (Payload) {string} border-color Color for all borders used in the forum
  * @apiParam (Payload) {string} header-bg-color Color for the forum header background
  * @apiParam (Payload) {string} header-font-color Font color for the forum header
  * @apiParam (Payload) {string} sub-header-color Color for sub headers and footers
  *
  * @apiSuccess {object} theme Object containing theme vars and values
  * @apiSuccess {string} theme.base-line-height Base line height for entire forum
  * @apiSuccess {string} theme.base-background-color The background color for the entire forum
  * @apiSuccess {string} theme.color-primary The primary color for the forum, used for buttons, etc...
  * @apiSuccess {string} theme.base-font-sans Font family for the entire forum
  * @apiSuccess {string} theme.base-font-color Base font color for entire forum
  * @apiSuccess {string} theme.base-font-size Base font size for entire forum
  * @apiSuccess {string} theme.secondary-font-color Secondary font color, used for description text
  * @apiSuccess {string} theme.input-font-color Font color for input fields
  * @apiSuccess {string} theme.input-background-color Background color for all input fields
  * @apiSuccess {string} theme.border-color Color for all borders used in the forum
  * @apiSuccess {string} theme.header-bg-color Color for the forum header background
  * @apiSuccess {string} theme.header-font-color Font color for the forum header
  * @apiSuccess {string} theme.sub-header-color Color for sub headers and footers
  *
  * @apiError (Error 500) InternalServerError There was an issue previewing the theme.
  */
exports.previewTheme = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminSettings.previewTheme' },
  validate: {
    payload: Joi.object().keys({
      'base-line-height': Joi.string(),
      'base-background-color': Joi.string(),
      'color-primary': Joi.string(),
      'base-font-sans': Joi.string(),
      'base-font-color': Joi.string(),
      'base-font-size': Joi.string(),
      'secondary-font-color': Joi.string(),
      'input-font-color': Joi.string(),
      'input-background-color': Joi.string(),
      'border-color': Joi.string(),
      'header-font-color': Joi.string(),
      'sub-header-color': Joi.string(),
      'header-bg-color': Joi.string()
    })
  },
  handler: function(request, reply) {
    var theme = request.payload;
    var keys = Object.keys(theme);
    var stream = fs.createWriteStream(previewVarsPath);
    stream.once('open', function() {
      keys.forEach(function(key) {
        stream.write('$' + key + ': ' + theme[key].toLowerCase() + ';\n');
      });
      stream.end();
    })
    .on('close', function() {
      copyCss()
      .then(function () { return sass('./public/css/preview.css'); })
      .then(function() { reply(theme); })
      .catch(function(err) {
        reply(Boom.badRequest(err));
      });
    });
  }
};


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
    return checkEmailerConfig(config.emailer);
  })
  .then(function() {
    return checkImagesConfig(config.images);
  })
  .then(function() { return config; });
}

function checkEmailerConfig(emailer) {
  return new Promise(function(resolve, reject) {
    if (!emailer) { return reject(new Error('Emailer configuration not found.')); }

    var errors = [];
    if (!emailer.sender) { errors.push('Emailer Sender not found.'); }
    if (!emailer.host) { errors.push('Emailer Host not found.'); }
    if (!emailer.port) { errors.push('Emailer Post not found.'); }
    if (!emailer.user) { errors.push('Emailer User not found.'); }
    if (!emailer.pass) { errors.push('Emailer Password not found.'); }

    if (errors.length > 0) { return reject(new Error(errors.join('\n'))); }
    else { return resolve(); }
  });
}

function checkImagesConfig(images) {
  return new Promise(function(resolve, reject) {
    if (!images) { return reject(new Error('Images configuration not found')); }

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

    if (errors.length > 0) { return reject(new Error(errors.join('\n'))); }
    else { return resolve(); }
  });
}
