var fs = require('fs');
var _ = require('lodash');
var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var Promise = require('bluebird');
var readLine = require('readline');
var sass = require(path.join(__dirname + '/../../../../scripts', 'tasks', 'sass'));
var copyCss = require(path.join(__dirname + '/../../../../scripts', 'tasks', 'copy_files'));
var varsDir = '/../../../../app/scss/ept/variables';
var previewVarsPath = path.normalize(__dirname + varsDir + '/_preview-variables.scss');
var defaultVarsPath = path.normalize(__dirname + varsDir + '/_default-variables.scss');
var customPath = '/../../../../content/sass/_custom-variables.scss';
var customVarsPath = path.normalize(__dirname + customPath);

var ConfigError = Promise.OperationalError;



/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {GET} /admin/settings/theme (Admin) Get Theme
  * @apiName GetTheme
  * @apiDescription Used to fetch theme vars in _custom-variables.scss
  *
  * @apiSuccess {string} base-line-height Base line height for entire forum
  * @apiSuccess {string} base-background-color The background color for the entire forum
  * @apiSuccess {string} color-primary The primary color for the forum, used for buttons, etc...
  * @apiSuccess {string} base-font-sans Font family for the entire forum
  * @apiSuccess {string} base-font-color Base font color for entire forum
  * @apiSuccess {string} base-font-size Base font size for entire forum
  * @apiSuccess {string} secondary-font-color Secondary font color, used for description text
  * @apiSuccess {string} input-font-color Font color for input fields
  * @apiSuccess {string} input-background-color Background color for all input fields
  * @apiSuccess {string} border-color Color for all borders used in the forum
  * @apiSuccess {string} header-bg-color Color for the forum header background
  * @apiSuccess {string} header-font-color Font color for the forum header
  * @apiSuccess {string} sub-header-color Color for sub headers and footers
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
  * @apiSuccess {string} base-line-height Base line height for entire forum
  * @apiSuccess {string} base-background-color The background color for the entire forum
  * @apiSuccess {string} color-primary The primary color for the forum, used for buttons, etc...
  * @apiSuccess {string} base-font-sans Font family for the entire forum
  * @apiSuccess {string} base-font-color Base font color for entire forum
  * @apiSuccess {string} base-font-size Base font size for entire forum
  * @apiSuccess {string} secondary-font-color Secondary font color, used for description text
  * @apiSuccess {string} input-font-color Font color for input fields
  * @apiSuccess {string} input-background-color Background color for all input fields
  * @apiSuccess {string} border-color Color for all borders used in the forum
  * @apiSuccess {string} header-bg-color Color for the forum header background
  * @apiSuccess {string} header-font-color Font color for the forum header
  * @apiSuccess {string} sub-header-color Color for sub headers and footers
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
      .error(request.errorMap.toHttpError);
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
  * @apiSuccess {string} base-line-height Base line height for entire forum
  * @apiSuccess {string} base-background-color The background color for the entire forum
  * @apiSuccess {string} color-primary The primary color for the forum, used for buttons, etc...
  * @apiSuccess {string} base-font-sans Font family for the entire forum
  * @apiSuccess {string} base-font-color Base font color for entire forum
  * @apiSuccess {string} base-font-size Base font size for entire forum
  * @apiSuccess {string} secondary-font-color Secondary font color, used for description text
  * @apiSuccess {string} input-font-color Font color for input fields
  * @apiSuccess {string} input-background-color Background color for all input fields
  * @apiSuccess {string} border-color Color for all borders used in the forum
  * @apiSuccess {string} header-bg-color Color for the forum header background
  * @apiSuccess {string} header-font-color Font color for the forum header
  * @apiSuccess {string} sub-header-color Color for sub headers and footers
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
    .error(request.errorMap.toHttpError);
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
  * @apiSuccess {string} base-line-height Base line height for entire forum
  * @apiSuccess {string} base-background-color The background color for the entire forum
  * @apiSuccess {string} color-primary The primary color for the forum, used for buttons, etc...
  * @apiSuccess {string} base-font-sans Font family for the entire forum
  * @apiSuccess {string} base-font-color Base font color for entire forum
  * @apiSuccess {string} base-font-size Base font size for entire forum
  * @apiSuccess {string} secondary-font-color Secondary font color, used for description text
  * @apiSuccess {string} input-font-color Font color for input fields
  * @apiSuccess {string} input-background-color Background color for all input fields
  * @apiSuccess {string} border-color Color for all borders used in the forum
  * @apiSuccess {string} header-bg-color Color for the forum header background
  * @apiSuccess {string} header-font-color Font color for the forum header
  * @apiSuccess {string} sub-header-color Color for sub headers and footers
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
      .error(request.errorMap.toHttpError);
    });
  }
};
