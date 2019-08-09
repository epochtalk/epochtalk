var path = require('path');
var images = require(path.normalize(__dirname + '/../plugins/images'));

var common = {};
module.exports = common;

common.export = () =>  {
  return [
    {
      name: 'common.images.sub',
      method: images.imageSub
    },
    {
      name: 'common.images.saveNoExpiration',
      method: images.saveImage
    },
    {
      name: 'common.images.avatarSub',
      method: images.avatarSub
    }
  ];
};
