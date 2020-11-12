var s3 = {};
module.exports = s3;

var path = require('path');
var mmm = require('mmmagic');
var AWS = require('aws-sdk');
var crypto = require('crypto');
var request = require('request');
var Promise = require('bluebird');
var through2 = require('through2');
var images = require(path.normalize(__dirname + '/images'));
var Magic = mmm.Magic;
var config;

// S3 Configurations
var client;

var createBucketPolicy = function() {
  return new Promise(function(resolve, reject) {
    var dir = config.images.s3.dir;
    var policy = {
      Id: 'Policy' + Date.now(),
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'Stmt' + Date.now(),
          Action: ['s3:GetObject'],
          Effect: 'Allow',
          Resource: 'arn:aws:s3:::' + config.images.s3.bucket + '/' + dir + '*',
          Principal: '*'
        }
      ]
    };
    policy = JSON.stringify(policy);

    var params = { Bucket: config.images.s3.bucket, Policy: policy };
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

    var corsParams = { Bucket: config.images.s3.bucket, CORSConfiguration: rules };
    client.putBucketCors(corsParams, function(err, data) {
      if (err) { reject(err); }
      else { resolve(data); }
    });
  });
};

var createImageKey = function() {
  return new Promise(function(resolve, reject) {
    var params = {
      Bucket: config.images.s3.bucket,
      Key: config.images.s3.dir,
      ContentLength: 0,
    };
    client.putObject(params, function(err, data) {
      if (err) { reject(err); }
      else { resolve(data); }
    });
  });
};

var generateImageUrl = function(filename) {
  var imageUrl = config.images.s3.root;
  imageUrl += config.images.s3.dir + filename;
  return imageUrl;
};

var uploadImage = function(url, filename) {
  return new Promise(function(resolveUpload, rejectUpload) {
    // check if this already exists in cdn
    var s3Url = generateImageUrl(filename);
    request.head(s3Url, function(err, response) {
      // if it already exists, just return
      if (response && response.statusCode === 200) { return resolveUpload(); }
      // otherwise, try uploading image to cdn
      else {

        // manual file type check
        var contentType = checkFileType(filename);

        // check file type
        var newStream = true;
        var fileTypeCheck = new Magic(mmm.MAGIC_MIME_TYPE);
        var ftc = through2(function(chunk, enc, cb) {
          fileTypeCheck.detect(chunk, function(err, result) {
            var error;
            if (err) { error = err; }
            if (result && newStream) {
              newStream = false;
              if (result.indexOf('image') !== 0 || result !== contentType) {
                error = new Error('File extension does not match analyzed content type');
              }
            }

            // next
            return cb(error, chunk);
          });
        });

        // check file size
        var size = 0;
        var sc = through2(function(chunk, enc, cb) {
          var error;
          size += chunk.length;
          if (size > config.images.maxSize) {
            error = new Error(`File size check failed; max size ${config.images.maxSize}`);
          }
          return cb(error, chunk);
        });

        // Handle relative paths
        if (url[0] === '/') { url = config.publicUrl + url; }

        // get image from url and pipe to cdn
        return new Promise(function(resolveStream, rejectStream) {
          var stream = request(url)
          .pipe(ftc)
          .on('error', function(err) {
            // file type check error
            return rejectStream(err);
          })
          .pipe(sc)
          .on('error', function(err) {
            // size check error
            return rejectStream(err);
          })
          .on('finish', function(data) {
            return resolveStream(stream);
          });
        })
        .then(function(stream) {
          return new Promise(function(resolveS3, rejectS3) {
            // write to s3
            var options = {
              Bucket: config.images.s3.bucket,
              Key: config.images.s3.dir + filename,
              ACL: 'public-read',
              ContentType: contentType,
              Body: stream
            };
            client.upload(options, function(err, data) {
              if(err) { return rejectS3(new Error('S3 write error; ' + err)); }
              else { return resolveS3(); }
            });
          });
        })
        .then(function() {
          return resolveUpload();
        })
        .catch(function(error) {
          return rejectUpload(new Error(error));
        });
      }
    });
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

s3.init = function(opts) {
  opts = opts || {};
  config = opts.config;

  if (config.images.storage === 's3') {
    s3.initClient()
    .then(function() {
      return s3.checkBucket()
      // bucket does not exist
      .catch(function() { return s3.createBucket(); });
    })
    .catch(function(error) { console.log('S3 Integration is Broken', error); });
  }
};

s3.initClient = function(accessKey, secretKey, region) {
  accessKey = accessKey || config.images.s3.accessKey;
  secretKey = secretKey || config.images.s3.secretKey;
  region = region || config.images.s3.region;

  AWS.config.update({
    secretAccessKey: secretKey,
    accessKeyId: accessKey,
    region: region
  });
  client = new AWS.S3();
  return Promise.resolve(client);
};

s3.checkBucket = function() {
  return new Promise(function(resolve, reject) {
    client.headBucket({ Bucket: config.images.s3.bucket }, function(err, data) {
      if (err) { return reject(err); }
      if (data) { return resolve(data); }
    });
  });
};

s3.createBucket = function() {
  return new Promise(function(resolve, reject) {
    client.createBucket({ Bucket: config.images.s3.bucket }, function(err, data) {
      if (err) { reject(err); }
      else { resolve(data); }
    });
  })
  .then(createBucketPolicy)
  .then(createCorsPolicy)
  .then(createImageKey);
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
  conditions.push({bucket: config.images.s3.bucket});
  conditions.push(['starts-with', '$key', key]);
  conditions.push({'acl': 'public-read'});
  conditions.push(['starts-with', '$Content-Type', 'image']);
  conditions.push(['content-length-range', 1, config.images.maxSize]);
  var policy = { expiration: expiration, conditions: conditions };
  policy = JSON.stringify(policy);
  policy = Buffer.from(policy).toString('base64');

  // sign policy to generate signature
  var signature = crypto.createHmac('sha1', config.images.s3.secretKey).update(Buffer.from(policy)).digest('base64');

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
  // image uploaded by client
  if (imgSrc.indexOf(config.images.s3.root) === 0) {
    return new Promise(function(resolve, reject) {
      // clear any expirations
      images.clearExpiration(imgSrc);
      // return original image url
      return resolve(imgSrc);
    });
  }
  // hotlink image
  else {
    var filename = images.generateHotlinkFilename(imgSrc);
    return uploadImage(imgSrc, filename)
    .then(function() {
      // return generated image url
      return generateImageUrl(filename);
    });
  }
};

s3.removeImage = function(imageUrl) {
  var root = config.images.s3.root;
  var file = imageUrl.replace(root, '');
  client.deleteObject({
    Bucket: config.images.s3.bucket,
    Key: file
  },
  function(err) { if (err) { console.log(err); } });
};
