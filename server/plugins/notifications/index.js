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
  db.notifications.create({ sender_id: datas.sender_id, receiver_id: datas.receiver_id, data: datas.data });
}

function getNotifications(datas) {
  db.notifications.latest(datas.user_id, datas.opts);
}

function getNotificationsCount(datas) {
  db.notifications.count(datas.user_id);
}
