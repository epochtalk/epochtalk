'use strict';
var config = require(__dirname + '/config');
var site = require(__dirname + '/site');
var log = require(__dirname + '/log');

log.debug('config: ' + JSON.stringify(config, undefined, 2));
site.listen(config.port);
log.info('Listening on port: ' + config.port);

