// Load modules
var Boom = require('boom');
var Hoek = require('hoek');
var jwt  = require('jsonwebtoken');


// Declare internals
var internals = {};
var redis;

exports.register = function (plugin, options, next) {
  if (!options.db) { return next(new Error('No db found in notifications')); }
  db = options.db;

  plugin.expose('spawnNotification', spawnNotification);
  plugin.expose('getNotifications', getNotifications);
  plugin.expose('getNotificationsCount', getNotificationsCount);
  next();
};

exports.register.attributes = {
  name: 'notifications',
  version: '1.0.0'
};

function spawnNotification(datas) {
  db.notifications.create(datas);
}

function getNotifications(datas) {
  db.notifications.latest(datas);
}

function getNotificationsCount(datas) {
  db.notifications.count(datas);
}
