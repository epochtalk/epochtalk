// Load modules
var Boom = require('boom');
var Hoek = require('hoek');
var jwt  = require('jsonwebtoken');


// Declare internals
var internals = {};
var redis;

// Use websocket
var path = require('path');
var websocketAPIKey = require(path.join(__dirname, '../../../config')).websocketAPIKey;
var socket = require(path.join(__dirname, '../../../websocket'));

exports.register = function (plugin, options, next) {
  if (!options.db) { return next(new Error('No db found in notifications')); }
  db = options.db;

  plugin.expose('spawnNotification', spawnNotification);
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

function getNotifications(datas) {
  return db.notifications.latest(datas);
}

function getNotificationsCounts(datas) {
  return db.notifications.counts(datas);
}

function dismissNotifications(datas) {
  return db.notifications.dismiss(datas);
}
