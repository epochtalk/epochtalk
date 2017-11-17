var path = require('path');


module.exports = {
  start: function() {
    require('dotenv');
    var SocketCluster = require('socketcluster').SocketCluster;
    var db = require(path.normalize(__dirname + '/db'));
    var config = require(path.normalize(__dirname + '/config'));
    var onlineUsers = require(path.normalize(__dirname + '/plugins/online'));
    return db.users.testConnection()
    .then(onlineUsers.logOptions)
    .then(onlineUsers.clear)
    .then(function() {
      return new Promise(function(resolve) {
        var socketCluster = new SocketCluster({
          authKey: config.authKey,
          workers: config.workers,
          brokers: config.brokers,
          wsEngine: config.wsEngine,
          protocol: config.protocol,
          protocolOptions: config.protocolOptions,
          port: config.port,
          host: config.host,
          appName: 'ept-ws',
          workerController: path.normalize(__dirname + '/worker.js'),
          allowClientPublish: false
        });
        return resolve(socketCluster);
      })
      // cleanup (process exit, flushes db)
      .then(function() {
        function exit(options, err) {
          if (err) { console.log(err); }
          console.log('[WSS] Flushing Online Users');

          return onlineUsers.clear()
          .then(function() { process.exit(); });
        }

        process.on('exit', exit);
        process.on('SIGINT', exit);
        process.on('uncaughtException', exit);
      });
    })
    .catch(console.log);
  }
};
