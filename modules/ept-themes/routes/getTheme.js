var path = require('path');
var Joi = require('@hapi/joi');
var Promise = require('bluebird');
var fs = require('fs');
var readLine = require('readline');
var common = require(path.normalize(__dirname + '/common'));
var customVarsPath = common.customVarsPath;
var previewVarsPath = common.previewVarsPath;
/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {GET} /theme (Admin) Get Theme
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
module.exports = {
  method: 'GET',
  path: '/api/theme',
  options: {
    auth: { strategy: 'jwt' },
    validate: { query: { preview: Joi.boolean() } },
    pre: [ { method: (request) => request.server.methods.auth.themes.getTheme(request.server, request.auth) } ]
  },
  handler: function(request) {
    var preview = request.query.preview;
    var previewExists = fs.statSync(previewVarsPath).size;
    var readFilePath = preview && previewExists ? previewVarsPath : customVarsPath;
    var rl = readLine.createInterface({
      input: fs.createReadStream(readFilePath),
      terminal: false
    });
    var theme = {};
    return new Promise(function(resolve, reject) {
      rl.on('line', function (line) {
        if (line.charAt(0) === '$') {
          var lineArr = line.split(':');
          var key = lineArr[0].split('$')[1].trim();
          var val = lineArr[1].split(';')[0].trim();
          theme[key] = val;
        }
      })
      .on('close', function() { return resolve(theme); })
      .on('error', reject);
    })
    .error(request.errorMap.toHttpError);
  }
};
