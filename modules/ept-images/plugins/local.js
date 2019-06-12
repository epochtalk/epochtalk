var local = {};
module.exports = local;

var fs = require('fs');
var path = require('path');
var Boom = require('boom');
var mmm = require('mmmagic');
var crypto = require('crypto');
var request = require('request');
var through2 = require('through2');
var imageStore = require(path.normalize(__dirname + '/common'));
var Magic = mmm.Magic;
var config;

local.init = function(opts) {
  opts = opts || {};
  config = opts.config;
};

local.uploadPolicy = function(filename) {
  var imageName = imageStore.generateUploadFilename(filename);
  var imageUrl = generateImageUrl(imageName);

  // create policy expiration
  var expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 5);
  expiration = expiration.getTime();

  // build a polcy for local
  var policy = { filename: imageName, expiration: expiration };
  policy = JSON.stringify(policy);

  // hash policy
  var cipher = crypto.createCipher('aes-256-ctr', config.privateKey);
  var policyHash = cipher.update(policy,'utf8','hex');
  policyHash += cipher.final('hex');

  // add this imageUrl to the image expiration
  imageStore.setExpiration(config.images.expiration, imageUrl);

  return {
    uploadUrl: '/api/images/upload',
    policy: policyHash,
    storageType: 'local',
    imageUrl: imageUrl
  };
};

local.saveImage = function(imgSrc) {
  // image uploaded by client
  var url;
  if (imgSrc.indexOf(config.publicUrl) === 0 || imgSrc.indexOf(config.images.local.path) === 0) {
    // clear any expirations
    imageStore.clearExpiration(imgSrc);
  }
  // hotlink image
  else {
    var filename = imageStore.generateHotlinkFilename(imgSrc);
    local.uploadImage(imgSrc, filename);
    url = generateImageUrl(filename);
  }

  return url;
};

var generateImageUrl = function(filename) {
  var imageUrl = config.images.local.path + filename;
  return imageUrl;
};

local.uploadImage = function(source, filename, reply) {
  var pathToFile = path.normalize(__dirname + '/../../../public/images');
  pathToFile = pathToFile + '/' + filename;
  var exists = fs.existsSync(pathToFile);  // check if file already exists

  if (exists) {
    if (reply) { return reply().code(204); }
  }
  else {
    // grab image
    var puller, error;
    if (reply) { puller = source; }
    else { puller = request(source); }
    puller.on('error', function(err) {
      deleteImage(err, pathToFile);
      if (reply) { error = Boom.badRequest('Could not process image'); }
    });
    puller.on('end', function () {
      if (reply) {
        if (error) { return reply(Boom.badImplementation(error)); }
        else { return reply().code(204); }
      }
    });

    // check file type
    var newStream = true;
    var fileTypeCheck = new Magic(mmm.MAGIC_MIME_TYPE);
    var ftc = through2(function(chunk, enc, cb) {
      fileTypeCheck.detect(chunk, function(err, result) {
        var error;
        if (err) { error = err; }

        // check results
        if (result && newStream) {
          newStream = false;
          if (result.indexOf('image') !== 0) {
            error = new Error('Invalid File Type');
          }
        }

        // next
        return cb(error, chunk);
      });
    });
    ftc.on('error', function(err) {
      deleteImage(err, pathToFile);
      if (reply) { error = Boom.unsupportedMediaType('File is not an image'); }
    });

    // check file size
    var size = 0;
    var sc = through2(function(chunk, enc, cb) {
      var error;
      size += chunk.length;
      if (size > config.images.maxSize) {
        error = new Error('Exceeded File Size');
      }
      return cb(error, chunk);
    });
    sc.on('error', function(err) {
      deleteImage(err, pathToFile);
      if (reply) { error = Boom.badRequest('Image Size Limit Exceeded'); }
    });

    // write to disk
    var writer = fs.createWriteStream(pathToFile);
    writer.on('error', function (err) {
      deleteImage(err, pathToFile);
      if (reply) { error = Boom.badImplementation(); }
    });

    puller.pipe(ftc).pipe(sc).pipe(writer);
  }
};

var deleteImage = function(err, pathToFile) {
  if (err) { console.log(err); }
  fs.unlink(pathToFile, function(error) {
    if (error && error.code === 'ENOENT') { /* ignore deleted files */ }
    else if (error) { console.log(error); }
  });
};

local.removeImage = function(imageUrl) {
  var pathArray = imageUrl.split('/');
  var filepath = path.normalize(__dirname + '/../../../public/images');
  filepath = filepath + '/' + pathArray[pathArray.length-1];
  deleteImage(undefined, filepath);
};
