module.exports = ['$q', '$http', 'Session',
function ($q, $http, Session) {
  return {
    policy: function(images) {
      // get all the image filenames
      var names = [];
      images.forEach(function(image) { names.push(image.name); });

      // get policy for each name
      return $http.post('/images/policy', names)
      .then(function(response) {
        response = response.data;
        for (var i = 0; i < names.length; i++) {
          images[i].policy = response[i];
        }

        return images;
      });
    },
    upload: function (image) {
      var deferred = $q.defer();
      var promise = deferred.promise;

      // get policy and signature
      var policy = image.policy.policy;
      var signature = image.policy.signature;
      var accessKey = image.policy.accessKey;
      var url = image.policy.uploadUrl;
      var key = image.policy.key;
      var imageUrl = image.policy.imageUrl;
      var storageType = image.policy.storageType;

      var token;
      if (storageType === 'local') { token = Session.getToken(); }

      // form data
      var fd = new FormData();
      fd.append('key', key);
      fd.append('acl', 'public-read');
      fd.append('Content-Type', image.file.type);
      fd.append('AWSAccessKeyId', accessKey);
      fd.append('policy', policy);
      fd.append('signature', signature);
      fd.append('file', image.file);

      // upload request and event bindings
      var xhr = new XMLHttpRequest();
      xhr.addEventListener('load', deferred.resolve, false);
      xhr.addEventListener('error', deferred.reject, false);
      xhr.upload.addEventListener('progress', deferred.notify, false);
      xhr.upload.addEventListener('error', deferred.reject, false);

      // Send the file
      xhr.open('POST', url, true);
      if (storageType === 'local') {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      }
      xhr.send(fd);

      // append promise properties
      promise.success = function(fn) {
        promise.then(function(response) {
          var xhr = response.srcElement || response.target;
          // successful upload
          if (xhr.status === 204) { fn(imageUrl); }
          // error uploading
          else { promise.error_fn(response); }
        });
        return promise;
      };
      promise.error = function(fn) {
        promise.error_fn = fn;
        promise.then(null, function(data) { fn(data); });
        return promise;
      };
      promise.progress = function(fn) {
        promise.then(null, null, function(response) {
          if (response.lengthComputable) {
            var percent = Math.round(response.loaded * 100 / response.total);
            fn(percent);
          }
        });
        return promise;
      };
      promise.abort = function() { xhr.abort(); };

      return promise;
    }
  };
}];
