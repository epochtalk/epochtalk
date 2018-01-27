var SCWorker = require('socketcluster/scworker');
var path = require('path');
var config = require(path.normalize(__dirname + '/config'));
var onlineUsers = require(path.normalize(__dirname + '/plugins/online'));
var subMiddleware = require(path.normalize(__dirname + '/middleware/online-subscribe'));

class Worker extends SCWorker {
  run() {
    var scServer = this.scServer;

    // authorize subscriptions
    scServer.addMiddleware(scServer.MIDDLEWARE_SUBSCRIBE, subMiddleware.subscribe);

    scServer.on('connection', function(socket) {
      var userId = 'server';
      var prefix = '[WSS]';
      var socketId = socket.id;
      var authToken = socket.authToken;
      if (authToken) { userId = socket.authToken.userId; }

      console.log(`${prefix} CONNECTION EVENT: user ${userId} connected to process ${process.pid}`);

      // epochtalk notification integration
      socket.on('notify', function(options) {
        // don't allow API key to be sent to client
        var APIKey = options.APIKey;
        delete options.APIKey;

        if (APIKey === config.APIKey) {
          scServer.exchange.publish(options.channel, options.data);
        }
      });

      socket.on('loggedIn', function() {
        if (socket.authToken) { userId = socket.authToken.userId; }
        if (userId) {
          var user = { id: userId, socketId: socketId };
          onlineUsers.add(user);
          console.log(`${prefix} LOGIN EVENT: user ${userId} has logged in on process ${process.pid}`);
        }
      });

      socket.on('loggedOut', function() {
        if (userId) {
          onlineUsers.remove({ id: userId, socketId: socketId });
          socket.deauthenticate();
          console.log(`${prefix} LOGOUT EVENT: user ${userId} has logged out on process ${process.pid}`);
          userId = '';
        }
      });

      // check if a user is online
      socket.on('isOnline', function(data, res) {
        var user = { id: data };
        return onlineUsers.isOnline(user)
        .then(function(isOnline) {
          return res(null, {id: data, online: isOnline});
        });
      });

      socket.on('disconnect', function() {
        if (userId) {
          onlineUsers.remove({ id: userId, socketId: socketId });
          console.log(`${prefix} LOGOUT EVENT: user ${userId} has logged out on process ${process.pid}`);
          userId = '';
        }

        var user = userId || 'server';
        console.log(`${prefix} DISCONNECTION EVENT: user ${user} disconnected from process ${process.pid}`);
      });

      socket.on('error', function(error) {
        if (userId) {
          onlineUsers.remove({ id: userId, socketId: socketId });
          console.log(`${prefix} LOGOUT EVENT: user ${userId} has logged out on process ${process.pid}`);
          userId = '';
        }

        console.log('SocketError:', error.message);
      });
    });
  }
}

new Worker();
