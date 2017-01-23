var path = require('path');
var autoModerator = require(path.normalize(__dirname + '/../autoModerator'));

function moderate(request) {
  return autoModerator.moderate(request);
}

module.exports = [
  { path: 'posts.create.pre', method: moderate },
  { path: 'posts.update.pre', method: moderate },
  { path: 'threads.create.pre', method: moderate }
];
