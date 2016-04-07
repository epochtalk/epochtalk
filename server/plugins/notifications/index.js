// Load modules
var Boom = require('boom');
var Hoek = require('hoek');
var jwt  = require('jsonwebtoken');

var db, websocketAPIKey;

// Use websocket
var path = require('path');
var socket = require(path.join(__dirname, '../../../websocket'));

exports.register = function (plugin, options, next) {
  if (!options.db) { return next(new Error('No db found in notifications')); }
  db = options.db;

  if (!options.config) { return next(new Error('No config found in notifications')); }
  websocketAPIKey = options.config.websocketAPIKey;

  plugin.expose('spawnNotification', spawnNotification);
  plugin.expose('systemNotification', systemNotification);
  plugin.expose('getNotifications', getNotifications);
  plugin.expose('getNotificationsCounts', getNotificationsCounts);
  plugin.expose('dismissNotifications', dismissNotifications);
  next();
};

exports.register.attributes = {
  name: 'notifications',
  version: '1.0.0'
};

function spawnNotification(datas) {
  return db.notifications.create(datas)
  .tap(function(dbNotification) {
    var options = {
      APIKey: websocketAPIKey,
      userId: dbNotification.receiver_id
    };
    socket.emit('notify', options);
  });
}

function systemNotification(datas) {
  var options = {
    APIKey: websocketAPIKey,
    channel: datas.channel,
    data: datas.data
  };
  socket.emit('notify', options);
}

function getNotifications(datas) {
  return db.notifications.latest(datas);
}

function getNotificationsCounts(datas) {
  return db.notifications.counts(datas);
}

function dismissNotifications(datas) {
  return db.notifications.dismiss(datas);
}
