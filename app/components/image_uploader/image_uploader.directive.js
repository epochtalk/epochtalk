var fs = require('fs');

module.exports = ['$timeout', 'S3ImageUpload', 'Alert',
  function($timeout, s3ImageUpload, Alert) {
  return {
    restrict: 'E',
    scope: {
      model: '=',
      purpose: '@',
      onDone: '&'
    },
    template: fs.readFileSync(__dirname + '/image_uploader.html'),
    link: function($scope, $element) {
      // directive initialization
      $scope.images = [];
      $scope.imagesUploading = false;
      $scope.imagesProgress = 0;
      var inputElement = $element.find('input')[0];
      $scope.openImagePicker = function() { inputElement.click(); };

      // more images modal
      $scope.imageModal = false;
      $scope.openImageModal = function() { $scope.imageModal = true; };
      $scope.fireDone = function(url) { $scope.onDone({ data: url }); };

      // input initialization
      if ($scope.purpose === 'avatar') {
        $scope.images[0] = { url: $scope.model };
      }
      else if ($scope.purpose === 'editor') {
        $(inputElement).attr('multiple', '');
      }
      else if ($scope.purpose === 'favicon') {
        $(inputElement).attr('accept', 'image/x-icon, image/png');
      }

      function upload(images) {
        $scope.imagesUploading = true;
        $scope.imagesProgress = 0;
        if ($scope.purpose === 'avatar' || $scope.purpose === 'logo' || $scope.purpose === 'favicon') { $scope.images = []; }
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
              updateImagesUploading();
            })
            .error(function() {
              imageProgress.progress = '--';
              imageProgress.status = 'Failed';
              updateImagesUploading();
              var message = 'Image upload failed for: ' + imageProgress.name + '.';
              message += 'Please ensure images are within size limits.';
              Alert.error(message);
            })
            .success(function(url) {
              imageProgress.progress = 100;
              imageProgress.status = 'Complete';
              imageProgress.url = url;
              updateImagesUploading();
              if ($scope.onDone) { $scope.onDone({data: url}); }
              if ($scope.purpose === 'avatar' || $scope.purpose === 'logo' || $scope.purpose === 'favicon') { $scope.model = url; }
            });
          })
          .catch(function() {
            imageProgress.progress = '--';
            imageProgress.status = 'Failed';
            updateImagesUploading();
            var message = 'Image upload failed for: ' + imageProgress.name + '.';
            message += 'Please ensure images are within size limits.';
            Alert.error(message);
          });
        });
      }

      function updateImagesUploading() {
        var uploading = false;
        var percentComplete = 0;
        var validImages = $scope.images.length;

        // check each image for it's status
        $scope.images.map(function(imageProgress) {
          if (imageProgress.status === 'Uploading') { uploading = true; }
          if (imageProgress.progress === '--') { validImages = validImages - 1; }
          else { percentComplete = percentComplete + imageProgress.progress; }
        });

        // compute percent complete
        $scope.imagesProgress = Math.round(percentComplete / validImages) + '%';

        // check if there are any images still uploading
        if (uploading) { return; }
        else { $scope.imagesUploading = false; }
      }

      // bind to changes in the image input
      // because angular can't handle ng-change on input[file=type]
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
      $parent.on('dragenter', cancelEvent);
      $parent.on('dragover', cancelEvent);
      $parent.on('drop', function(e) {
        cancelEvent(e);
        var dt = e.dataTransfer;
        var fileList = dt.files;
        var images = [];
        for (var i = 0; i < fileList.length; i++) {
          var file = fileList[i];
          if (!file.type.match(/image.*/)) { continue; }
          images.push(file);
        }
        if ($scope.purpose === 'avatar' || $scope.purpose === 'logo' || $scope.purpose === 'favicon') { images = [images[0]]; }
        upload(images);
      });

    }
  };
}];
