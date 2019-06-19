var path = require('path');

module.exports = {
  testConnection: require(path.normalize(__dirname + '/db')).db.testConnection,
  searchUsernames: require(path.normalize(__dirname + '/searchUsernames')),
  page: require(path.normalize(__dirname + '/page.js')),
  pagePublic: require(path.normalize(__dirname + '/pagePublic.js')),
  count: require(path.normalize(__dirname + '/count.js')),
  userByEmail: require(path.normalize(__dirname + '/userByEmail.js')),
  userByUsername: require(path.normalize(__dirname + '/userByUsername.js')),
  create: require(path.normalize(__dirname + '/create.js')),
  update: require(path.normalize(__dirname + '/update.js')),
  find: require(path.normalize(__dirname + '/find.js')),
  trackIp: require(path.normalize(__dirname + '/trackIp.js')),
  getKnownIps: require(path.normalize(__dirname + '/getKnownIps.js')),
  putUserThreadViews: require(path.normalize(__dirname + '/putUserThreadViews.js')),
  deactivate: require(path.normalize(__dirname + '/deactivate.js')),
  reactivate: require(path.normalize(__dirname + '/reactivate.js')),
  delete: require(path.normalize(__dirname + '/delete.js')),
  getLastActive: require(path.normalize(__dirname + '/getLastActive')),
  setLastActive: require(path.normalize(__dirname + '/setLastActive')),
  addRoles: require(path.normalize(__dirname + '/addRoles')),
  removeRole: require(path.normalize(__dirname + '/removeRole')),
  preferences: require(path.normalize(__dirname + '/preferences'))
};
