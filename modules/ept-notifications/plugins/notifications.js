// Load modules
var _ = require('lodash');

var db, websocket, websocketAPIKey;

var path = require('path');

exports.register = function (plugin, options, next) {
  if (!options.db) { return next(new Error('No options.db found in notifications module')); }
  db = options.db;
  if (!options.websocket) { return next(new Error('No options.websocket found in notifications module')); }
  websocket = options.websocket;

  if (!options.config) { return next(new Error('No config found in notifications')); }
  websocketAPIKey = options.config.websocketAPIKey;

  plugin.expose('spawnNotification', spawnNotification);
  plugin.expose('systemNotification', systemNotification);
  next();
};

exports.register.attributes = {
  name: 'notifications',
  version: '1.0.0'
};

function spawnNotification(datas) {
  var cloneDatas = _.cloneDeep(datas);
  return db.notifications.create(cloneDatas)
  .tap(function() {
    systemNotification(datas);
  });
}

function systemNotification(datas) {
  var options = {
    APIKey: websocketAPIKey,
    channel: JSON.stringify(datas.channel),
    data: datas.data
  };
  websocket.emit('notify', options);
}
