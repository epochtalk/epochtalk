var path = require('path');
var config = require(path.normalize(__dirname + '/../../../config'));

/**
  * @apiVersion 0.3.0
  * @apiGroup Settings
  * @api {GET} /settings/web Website Configurations
  * @apiName WebSettings
  * @apiDescription Used to fetch website settings such as the logo, favicon, website description/title and keywords
  *
  * @apiSuccess {string} title The title of the website
  * @apiSuccess {string} description The description text for the website
  * @apiSuccess {string} keywords Keywords to be used in the metatags of the website
  * @apiSuccess {string} favicon URL for the favicon image
  * @apiSuccess {string} logo URL for the forums logo image
  */
exports.webConfigs = {
  handler: function(request, reply) { reply(config.website); }
};
