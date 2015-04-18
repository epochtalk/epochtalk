var fs = require('fs');

module.exports = [
  '$timeout', 'S3ImageUpload',
  function($timeout, s3ImageUpload) {
  return {
    restrict: 'E',
    scope: {
      model: '=',
      purpose: '@',
      onDone: '&'
    },
    template: fs.readFileSync(__dirname + '/image_uploader.html'),
    link: function($scope, $element, $attrs) {
      // directive initialization
      $scope.images = [];
      $scope.model = $scope.model || '';
      var inputElement = $element.find('input')[0];
      $scope.openImagePicker = function() { inputElement.click(); };

      // more images modal
      $scope.imageModal = false;
      $scope.openImageModal = function() { $scope.imageModal = true; };
      $scope.fireDone = function(url) { $scope.onDone({ data: url }); };

      // input initialization
      if ($scope.purpose === 'editor') {
        $(inputElement).attr('multiple', '');
      }

      function upload(images) {
        if ($scope.purpose === 'avatar') { $scope.images = []; }
        // upload each image
        images.forEach(function(image) {
          var imageProgress = {
            status: 'Initializing',
            name: image.name,
            progress: 0
          };
          $scope.images.push(imageProgress);

          // get policy for this image
          s3ImageUpload.policy(image.name)
          .then(function(policy) {
            imageProgress.id = policy.data.filename;
            imageProgress.status = 'Starting';

            // upload image to s3
            return s3ImageUpload.upload(policy, image)
            .progress(function(percent) {
              imageProgress.progress = percent;
              imageProgress.status = 'Uploading';
            })
            .error(function(data) {
              imageProgress.progress = '--';
              imageProgress.status = 'Failed';
            })
            .success(function(url) {
              imageProgress.status = 'Complete';
              imageProgress.url = url;
              if ($scope.onDone) { $scope.onDone({data: url}); }
              if ($scope.purpose === 'avatar') { $scope.model = url; }
            });
          })
          .catch(function() {
            imageProgress.progress = '--';
            imageProgress.status = "Failed";
          });
        });
      }

      // bind to changes in the image input
      // because angular can handle ng-change on input[file=type]
      angular.element(inputElement).on('change', function() {
        // get all the images from the file picker
        var fileList = inputElement.files;
        var images = [];
        for (var i = 0; i < fileList.length; i++) {
          images.push(fileList[i]);
        }
        upload(images);
        inputElement.value = ''; // clear filelist for reuse
      });

      // drap and drop implementation
      var $parent = $element.parent();
      var cancelEvent = function(e) {
        e.stopPropagation();
        e.preventDefault();
      };
      $parent.on("dragenter", cancelEvent);
      $parent.on("dragover", cancelEvent);
      $parent.on("drop", function(e) {
        cancelEvent(e);
        var dt = e.dataTransfer;
        var fileList = dt.files;
        var images = [];
        for (var i = 0; i < fileList.length; i++) {
          var file = fileList[i];
          if (!file.type.match(/image.*/)) { continue; }
          images.push(file);
        }
        if ($scope.purpose === 'avatar') { images = [images[0]]; }
        upload(images);
      });

    }
  };
}];
