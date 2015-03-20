'use strict';
/* jslint node: true */

module.exports = ['$q', '$http', function ($q, $http) {
  return {
    policy: function(filename) {
      return $http.post('/policy', { filename: filename });
    },
    upload: function (policyResponse, image) {
      var deferred = $q.defer();
      var promise = deferred.promise;

      // get policy and signature
      var data = policyResponse.data;
      var policy = data.policy;
      var signature = data.signature;
      var accessKey = data.accessKey;
      var url = data.uploadUrl;
      var key = data.key;
      var imageUrl = data.imageUrl;

      // form data
      var fd = new FormData();
      fd.append('key', key);
      fd.append('acl', 'public-read');
      fd.append('Content-Type', image.type);
      fd.append('AWSAccessKeyId', accessKey);
      fd.append('policy', policy);
      fd.append('signature', signature);
      fd.append("file", image);

      // upload request and event bindings
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("load", deferred.resolve, false);
      xhr.addEventListener("error", deferred.reject, false);
      xhr.upload.addEventListener("progress", deferred.notify, false);
      xhr.upload.addEventListener("error", deferred.reject, false);

      // Send the file
      xhr.open('POST', url, true);
      xhr.send(fd);

      // append promise properties
      promise.success = function(fn) {
        promise.then(function(response) {
          var xhr = response.srcElement || response.target;
          // successful upload
          if (xhr.status === 204) { fn(imageUrl); }
          // error uploading
          else { promise.error_fn(); }
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
