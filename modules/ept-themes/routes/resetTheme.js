var Promise = require('bluebird');
var fs = require('fs');
var readLine = require('readline');
var sass = require(path.join(__dirname + '/../../../scripts', 'tasks', 'sass'));
var copyCss = require(path.join(__dirname + '/../../../scripts', 'tasks', 'copy_files'));
var common = require(path.normalize(__dirname + '/common'));
var customVarsPath = common.customVarsPath;
var previewVarsPath = common.previewVarsPath;
var defaultVarsPath = common.defaultVarsPath;

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {POST} /theme (Admin) Reset Theme
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
module.exports = {
  method: 'POST',
  path: '/api/theme',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: { type: 'adminSettings.resetTheme' }
    },
    pre: [ { method: (request) => request.server.methods.auth.themes.resetTheme(request.server, request.auth) } ]
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
