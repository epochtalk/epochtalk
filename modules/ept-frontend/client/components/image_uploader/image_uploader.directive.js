var Promise = require('bluebird');
var directive = ['$timeout', 'S3ImageUpload', 'Alert', function($timeout, s3ImageUpload, Alert) {
  return {
    restrict: 'E',
    scope: {
      model: '=',
      purpose: '@',
      reset: '=',
      onDone: '&'
    },
    template: require('./image_uploader.html'),
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
      $scope.fireDone = function(image) {
        image.added = true;
        $scope.onDone({ data: image.url });
        setTimeout(function() {
          image.added = false;
          $scope.$apply();
        }, 1000);
      };

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

      $scope.$watch(function() { return $scope.reset; }, function(newValue) {
        if (newValue) { $scope.images = []; $scope.reset = false; }
      });

      // image upload function
      function upload(fsImages) {
        $scope.currentImages = [];

        if (fsImages.length > 10) {
          return $timeout(function() { Alert.error('Error: Exceeded 10 images.'); });
        }

        // (re)prime loading and progress variables
        $scope.imagesUploading = true;
        $scope.imagesProgress = 0;
        $scope.imagesProgressSum = 0;

        /**
         * Image = {
         *   name: {string} The filename of the string (provided by host computer),
         *   file: {ImageOjbect} The image itself,
         *   status: {string} The status of the image upload,
         *   progress: {number} Progession of the upload as percent,
         *   policy: {policyObject} S3 or local policy object,
         *   url: {string} The url where the image is hosted (upon upload completion)
         */
         // prep each image
        var errImages = [];
        fsImages.forEach(function(fsImage) {
          var maxImageSize = forumData.max_image_size;
          var image = {
            name: fsImage.name,
            file: fsImage,
            status: 'Initializing',
            progress: 0
          };
          if (fsImage.size > maxImageSize) {
            errImages.push(fsImage.name);
          }
          else {
            $scope.currentImages.push(image);
          }
        });

        var warningMsg = 'Some images exceeded the max image upload size: [' + errImages.join(', ') + ']';

        if (!$scope.currentImages.length) {
          return $timeout(function() { Alert.warning(warningMsg); });
        }
        // the number of images that are still being uploaded
        $scope.uploadingImages = $scope.currentImages.length;
        // append a policy on to each image
        return s3ImageUpload.policy($scope.currentImages)
        // upload each image
        .then(function(images) {
          return Promise.map(images, function(image, index) {
            $scope.currentImages[index].status = 'Starting';
            return s3ImageUpload.upload(image)
            .progress(function(percent) {
              updateImagesUploading(index, percent);
            })
            .error(function(err) {
              updateImagesUploading(index);
              var message = 'Image upload failed for: ' + image.name + '. ';
              if (err.status === 429) { message += 'Exceeded 10 images in batch upload.'; }
              else if (err.message) { console.log(err); }
              else { message += 'Error: ' + err.message; }
              Alert.error(message);
            })
            .success(function(url) {
              updateImagesUploading(index, 100, url);
              if ($scope.onDone) { $scope.onDone({data: url}); }
              if ($scope.purpose === 'avatar' || $scope.purpose === 'logo' || $scope.purpose === 'favicon') { $scope.model = url; }
              else { $scope.images.push(image); }
            })
            .catch(function(err) {
              updateImagesUploading(index);
              var message = 'Image upload failed for: ' + image.name + '. ';
              if (err.status === 429) { message += 'Exceeded 10 images in batch upload.'; }
              else { message += 'Error: ' + err.message; }
              Alert.error(message);
            });
          })
          .then(function() {
            // log error images after all uploads finish
            if (errImages.length) {
              return $timeout(function() { Alert.warning(warningMsg); });
            }
          });
        });
      }

      // update loading status
      function updateImagesUploading(index, percent, url) {
        // on successful update
        if (percent) {
          // update images' progress sum
          // (subtract old value and add new value)
          $scope.imagesProgressSum = $scope.imagesProgressSum - $scope.currentImages[index].progress + percent;
          // update the image's progress
          $scope.currentImages[index].progress = percent;
          // update the image's properties
          if (percent === 100 && url) {
            // on complete, with url populated
            // set the image URL
            // and remove from currentlyUploadingImages
            $scope.currentImages[index].status = 'Complete';
            $scope.currentImages[index].url = url;
            $scope.uploadingImages--;
          }
          else {
            $scope.currentImages[index].status = 'Uploading';
          }
        }
        // on upload error or failure
        else {
          $scope.imagesProgressSum = $scope.imagesProgressSum - $scope.currentImages[index].progress;
          $scope.currentImages[index].progress = '--';
          image.status = 'Failed';
          $scope.uploadingImages--;
        }

        $scope.imagesProgress = $scope.imagesProgressSum / $scope.currentImages.length + '%';

        if (!($scope.uploadingImages > 0)) {
          $scope.imagesUploading = false;
        }
      }

      function cullImages(fileList) {
        var images = [];
        for (var i = 0; i < fileList.length; i++) {
          var file = fileList[i];
          if (!file.type.match(/image.*/)) { continue; }
          images.push(file);
        }
        if ($scope.purpose === 'avatar' || $scope.purpose === 'logo' || $scope.purpose === 'favicon') { images = [images[0]]; }

        if (images.length > 0) { upload(images); }
        else { Alert.warning('No Images Found'); $scope.$apply(); }
      }

      // bind to changes in the image input
      // because angular can't handle ng-change on input[file=type]
      angular.element(inputElement).on('change', function() {
        // get all the images from the file picker
        cullImages(inputElement.files);
        inputElement.value = ''; // clear filelist for reuse
      });

      // drap and drop implementation
      var $parent = $scope.purpose === 'editor' ? angular.element('.editor-input') : $element.parent();
      var $dragZone = angular.element('.editor-drag-container');

      var cancelEvent = function(e) {
        e.stopPropagation();
        e.preventDefault();
        if ($dragZone) {
          $dragZone.addClass('visible');
        }
      };

      var removeDrag = function(e) {
        e.stopPropagation();
        e.preventDefault();
        if ($dragZone) {
          $dragZone.removeClass('visible');
        }
      };

      var dropEvent = function(e) {
        removeDrag(e);
        var dt = e.dataTransfer || e.originalEvent.dataTransfer;
        cullImages(dt.files);
      };

      $parent.on('dragenter', cancelEvent);
      $parent.on('dragover', cancelEvent);
      $dragZone.on('dragenter', cancelEvent);
      $dragZone.on('dragover', cancelEvent);
      $dragZone.on('dragend', removeDrag);
      $dragZone.on('dragexit', removeDrag);
      $dragZone.on('dragleave', removeDrag);

      $parent.on('drop', dropEvent);
      $dragZone.on('drop', dropEvent);
    }
  };
}];

module.exports = angular.module('ept.directives.image-uploader', [])
.directive('imageUploader', directive);
