"use strict";

angular.module("risevision.storage.upload")
.controller("UploadController",
["$scope", "$rootScope", "$stateParams", "FileUploader", "UploadURIService", "FileListService", 
 "$translate", "STORAGE_UPLOAD_CHUNK_SIZE",
function ($scope, $rootScope, $stateParams, uploader, uriSvc, filesSvc, $translate, chunkSize) {
  $scope.uploader = uploader;
  $scope.status = {};
  $scope.completed = [];

  $scope.removeItem = function(item) {
    uploader.cancelItem(item);
  };

  $scope.activeUploadCount = function() {
    return uploader.queue.filter(function(file) {
      return file.isUploading;
    }).length;
  };

  $scope.getErrorCount = function() {
    return uploader.getErrorCount();
  };

  $scope.getNotErrorCount = function() {
    return uploader.getNotErrorCount();
  };

  $scope.retryFailedUploads = function() {
    uploader.queue.forEach(function(f) {
      if(f.isError) {
        uploader.retryItem(f);
      }
    });
  };

  $scope.cancelAllUploads = function() {
    uploader.removeAll();
  };

  uploader.onAfterAddingFile = function(fileItem) {
    console.info("onAfterAddingFile", fileItem.file.name);

    if(!fileItem.isRetrying) {
      fileItem.file.name = decodeURIComponent($stateParams.folderPath || "") + fileItem.file.name;
    }

    $translate("storage-client.uploading", { filename: fileItem.file.name }).then(function(msg) {
      $scope.status.message = msg;
    });

    uriSvc.getURI(fileItem.file)
    .then(function(resp) {
      $rootScope.$emit("refreshSubscriptionStatus", "trial-available");

      fileItem.url = resp;
      fileItem.chunkSize = chunkSize;
      uploader.uploadItem(fileItem);
    })
    .then(null, function(resp) {
      console.log("getURI error", resp);
      $scope.uploader.notifyErrorItem(fileItem);
      $scope.status.message = resp;
    });
  };

  uploader.onBeforeUploadItem = function(item) {
    $translate("storage-client.uploading", { filename: item.file.name }).then(function(msg) {
      $scope.status.message = msg;
    });
  };

  uploader.onCancelItem = function(item) {
    uploader.removeFromQueue(item);
  };

  uploader.onCompleteItem = function(item) {
    if (item.isSuccess) {
      $scope.completed.push(item.file.name);
    }

    if($scope.activeUploadCount() === 0) {
      uriSvc.notifyGCMTargetsChanged($scope.completed).then(function(resp) {
        console.log("uriSvc.notifyGCMTargetsChanged", resp);
        $scope.completed = [];
      });
    }

    if (item.isCancel) {
      return;
    }
    else if (!item.isSuccess) {
      $translate("storage-client.upload-failed").then(function(msg) {
        $scope.status.message = msg;
      });
      return;
    }
    
    var file = {
      "name": item.file.name,
      "updated": {"value": new Date().valueOf().toString()},
      "size": item.file.size,
      "type": item.file.type
    };

    filesSvc.addFile(file);

    uploader.removeFromQueue(item);
  };
}])

.directive("storageFileSelect", [function() {
  return {
    link: function(scope, element, attributes) {
      var uploader = scope.$eval(attributes.uploader);

      element.bind("change", function() {
        uploader.addToQueue(this.files);

        element.prop("value", null);
      });
    }
  };
}])
;
