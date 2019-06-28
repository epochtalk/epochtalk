var path = require('path');

module.exports = {
  addImageExpiration: require(path.normalize(__dirname + '/addImageExpiration')),
  clearImageExpiration: require(path.normalize(__dirname + '/clearImageExpiration')),
  getExpiredImages: require(path.normalize(__dirname + '/getExpiredImages')),
  addPostImage: require(path.normalize(__dirname + '/addPostImage')),
  removePostImages: require(path.normalize(__dirname + '/removePostImages')),
  getDeletedPostImages: require(path.normalize(__dirname + '/getDeletedPostImages')),
  getImageReferences: require(path.normalize(__dirname + '/getImageReferences')),
  deleteImageReference: require(path.normalize(__dirname + '/deleteImageReference'))
};
