'use strict';
/* jslint node: true */

var lodash = require('lodash');

module.exports = ['$http', function ($http) {
  return {
    upload: function(file, uploadUrl){
      var fd = new FormData();
      fd.append('file', file);
      $http.post(uploadUrl, fd, {
        transformRequest: lodash.identity,
        headers: {'Content-Type': undefined}
      })
      .success(function(){
        console.log('file uploaded');
      })
      .error(function(){
        console.log('file upload failed');
      });
    }
  };
}];