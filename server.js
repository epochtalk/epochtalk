'use strict';
var config = require('./server/config');
var site = require('./server/site');
console.log('Config: ' + JSON.stringify(config));

site.listen(config.port);
console.log('Listening on port: ' + config.port);
