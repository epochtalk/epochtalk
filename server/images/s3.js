var s3 = {};
module.exports = s3;

var path = require('path');
var mmm = require('mmmagic');
var AWS = require('aws-sdk');
var crypto = require('crypto');
var request = require('request');
var Promise = require('bluebird');
var through2 = require('through2');
var images = require(path.normalize(__dirname + '/index'));
var config = require(path.normalize(__dirname + '/../../config'));
var bucket = config.images.s3.bucket;
var Magic = mmm.Magic;

// S3 Configurations
var client;
var checkBucket = function() {
  if (config.images.storage !== 's3') { return; }

  AWS.config.update({
    secretAccessKey: config.images.s3.secretKey,
    accessKeyId: config.images.s3.accessKey,
    region: config.images.s3.region
  });
  client = new AWS.S3();
  client.headBucket({ Bucket: bucket }, function(err, data) {
    if (err) { createBucket(); }
  });
};

var createBucket = function() {
  return new Promise(function(resolve, reject) {
    client.createBucket({ Bucket: bucket }, function(err, data) {
      if (err) { reject(err); }
      else { resolve(data); }
    });
  })
  .then(createBucketPolicy)
  .then(createCorsPolicy)
  .then(createImageKey);
};

var createBucketPolicy = function() {
  return new Promise(function(resolve, reject) {
    var dir = config.images.s3.dir;
    dir = dir.substring(0, dir.length - 1);
    var policy = {
      Id: 'Policy' + Date.now(),
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'Stmt' + Date.now(),
          Action: ['s3:GetObject'],
          Effect: 'Allow',
          Resource: 'arn:aws:s3:::' + bucket + '/' + dir,
          Principal: '*'
        }
      ]
    };
    policy = JSON.stringify(policy);

    var params = { Bucket: bucket, Policy: policy };
    client.putBucketPolicy(params, function(err, data) {
      if (err) { reject(err); }
      else { resolve(data); }
    });
  });
};

var createCorsPolicy = function() {
  return new Promise(function(resolve, reject) {
    var rules = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedOrigins: ['*'],
          AllowedMethods: ['GET', 'POST']
        }
      ]
    };

    var corsParams = { Bucket: bucket, CORSConfiguration: rules };
    client.putBucketCors(corsParams, function(err, data) {
      if (err) { reject(err); }
      else { resolve(data); }
    });
  });
};

var createImageKey = function() {
  return new Promise(function(resolve, reject) {
    var params = {
      Bucket: bucket,
      Key: config.images.s3.dir,
      ContentLength: 0,
    };
    client.putObject(params, function(err, data) {
      if (err) { reject(err); }
      else { resolve(data); }
    });
  });
};

checkBucket();

var generateImageUrl = function(filename) {
  var imageUrl = config.images.s3.root;
  imageUrl += config.images.s3.dir + filename;
  return imageUrl;
};

var uploadImage = function(url, filename) {
  // check if this already exists in cdn
  var s3Url = generateImageUrl(filename);
  request.head(s3Url, function(err, response) {
    // if it already exists, just return
    if (response && response.statusCode === 200) { return; }
    else { // otherwise, try uploading image to cdn

      // manual file type check
      var contentType = checkFileType(filename);

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
            if (result.indexOf('image') !== 0 || result !== contentType) {
              error = new Error('Invalid File Type');
            }
          }

          // next
          return cb(error, chunk);
        });
      });
      ftc.on('error', function(err) { return console.log(err); });

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
      sc.on('error', function(err) { return console.log(err); });

      // get image from url and pipe to cdn
      var stream = request(url)
      .on('error', function(err) { console.log(err); })
      .pipe(ftc).pipe(sc);

      // write to s3
      var options = {
        Bucket: bucket,
        Key: config.images.s3.dir + filename,
        ACL: 'public-read',
        ContentType: contentType,
        Body: stream
      };
      client.upload(options, function(err, data) {
        if(err) { console.log(err); }
      });
    }
  });
};

var checkFileType = function(filename) {
  var ext = path.extname(filename);
  if (ext === '.jpg' || ext === '.jpeg') { return 'image/jpeg'; }
  else if (ext === '.png') { return 'image/png'; }
  else if (ext === '.gif') { return 'image/gif'; }
  else if (ext === '.bmp') { return 'image/bmp'; }
  else if (ext === '.tiff') { return 'image/tiff'; }
  else { return ''; }
};

s3.uploadPolicy = function(filename) {
  var imageName = images.generateUploadFilename(filename);
  var imageUrl = generateImageUrl(imageName);
  var key = config.images.s3.dir + imageName;

  // build policy
  var expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 5);
  expiration = expiration.toISOString();
  var conditions = [];
  conditions.push({bucket: bucket});
  conditions.push(['starts-with', '$key', key]);
  conditions.push({'acl': 'public-read'});
  conditions.push(['starts-with', '$Content-Type', 'image']);
  conditions.push(['content-length-range', 1024, config.images.maxSize]);
  var policy = { expiration: expiration, conditions: conditions };
  policy = JSON.stringify(policy);
  policy = new Buffer(policy).toString('base64');

  // sign policy to generate signature
  var signature = crypto.createHmac('sha1', config.images.s3.secretKey).update(new Buffer(policy)).digest('base64');

  // add this imageUrl to the image expiration
  images.setExpiration(config.images.expiration, imageUrl);

  return {
    policy: policy,
    signature: signature,
    accessKey: config.images.s3.accessKey,
    uploadUrl: config.images.s3.root,
    key: key,
    imageUrl: imageUrl
  };
};

s3.saveImage = function(imgSrc) {
  var url;

  // image uploaded by client
  if (imgSrc.indexOf(config.images.s3.root) === 0) {
    // clear any expirations
    images.clearExpiration(imgSrc);
  }
  // hotlink image
  else {
    var filename = images.generateHotlinkFilename(imgSrc);
    uploadImage(imgSrc, filename);
    url = generateImageUrl(filename);
  }

  return url;
};

s3.removeImage = function(imageUrl) {
  var root = config.images.s3.root;
  var file = imageUrl.replace(root, '');
  client.deleteObject({
    Bucket: bucket,
    Key: file
  },
  function(err) { if (err) { console.log(err); } });
};
