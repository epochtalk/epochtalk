var path = require('path');

module.exports = {
  ads: {
    byRound: require(path.normalize(__dirname + '/ads/byRound')),
    create: require(path.normalize(__dirname + '/ads/create')),
    duplicate: require(path.normalize(__dirname + '/ads/duplicate')),
    edit: require(path.normalize(__dirname + '/ads/edit')),
    current: require(path.normalize(__dirname + '/ads/current')),
    remove: require(path.normalize(__dirname + '/ads/remove')),
  },
  analytics: {
    ads: {
      update: require(path.normalize(__dirname + '/analytics/ads/update')),
      views: require(path.normalize(__dirname + '/analytics/ads/views'))
    },
    factoids: {
      update: require(path.normalize(__dirname + '/analytics/factoids/update')),
      views: require(path.normalize(__dirname + '/analytics/factoids/views'))
    }
  },
  factoids: {
    all: require(path.normalize(__dirname + '/factoids/all')),
    create: require(path.normalize(__dirname + '/factoids/create')),
    edit: require(path.normalize(__dirname + '/factoids/edit')),
    random: require(path.normalize(__dirname + '/factoids/random')),
    remove: require(path.normalize(__dirname + '/factoids/remove')),
    enable: require(path.normalize(__dirname + '/factoids/enable')),
    enableAll: require(path.normalize(__dirname + '/factoids/enableAll')),
    disable: require(path.normalize(__dirname + '/factoids/disable')),
    disableAll: require(path.normalize(__dirname + '/factoids/disableAll'))
  },
  rounds: {
    create: require(path.normalize(__dirname + '/rounds/create')),
    current: require(path.normalize(__dirname + '/rounds/current')),
    find: require(path.normalize(__dirname + '/rounds/find')),
    max: require(path.normalize(__dirname + '/rounds/max')),
    next: require(path.normalize(__dirname + '/rounds/next')),
    previous: require(path.normalize(__dirname + '/rounds/previous')),
    rotate: require(path.normalize(__dirname + '/rounds/rotate'))
  }
};
