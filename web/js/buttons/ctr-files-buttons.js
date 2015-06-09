"use strict";

angular.module("risevision.storage.buttons.files", ["risevision.storage.gapi", "risevision.common.config", "risevision.storage.download", "risevision.storage.files"])
.controller("DeleteInstanceCtrl", ["$scope", "$modalInstance", "confirmationMessage",
  function($scope, $modalInstance, confirmationMessage) {
    $scope.confirmationMessage = confirmationMessage;

    $scope.ok = function() {
        $modalInstance.close();
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
  }
])
.controller("FilesButtonsController",
["$scope", "$rootScope", "$stateParams", "$window","$modal", "$log", "$timeout", "$filter", "FileListService",
 "GAPIRequestService", "STORAGE_FILE_URL", "DownloadService", "$q", "$translate", "$state", "STORAGE_CLIENT_API",
 "FULLSCREEN", "SELECTOR_TYPE",
function ($scope,$rootScope, $stateParams, $window, $modal, $log, $timeout, $filter, listSvc, requestSvc,
          STORAGE_FILE_URL, downloadSvc, $q, $translate, $state, STORAGE_CLIENT_API, FULLSCREEN, SELECTOR_TYPE) {
  var bucketName = "risemedialibrary-" + $stateParams.companyId;
  var folderSelfLinkUrl = STORAGE_CLIENT_API + bucketName + "/o?prefix=";

  $scope.storageFull = FULLSCREEN;
  $scope.showCloseButton = !$scope.storageFull;
  $scope.selectorType = SELECTOR_TYPE;
  $scope.singleFileSelector = SELECTOR_TYPE === "single-file";
  $scope.multipleFileSelector = SELECTOR_TYPE === "multiple-file";

  $scope.filesDetails = listSvc.filesDetails;
  $scope.fileListStatus = listSvc.statusDetails;
  $scope.statusDetails = { code: 200, message: "" };
  $scope.isPOCollapsed = true;
  $scope.pendingOperations = [];
  $scope.leavePageMessage = "";
  $scope.rejectedUploads = downloadSvc.rejectedUploads;
  $scope.isRUCollapsed = false;

  $translate("storage-client.pending-ops-leave-page").then(function(value) {
    $scope.leavePageMessage = value;
  });

  $rootScope.$on("storage-client:company-id-changed", function(event, companyId) {
    bucketName = "risemedialibrary-" + companyId;
    folderSelfLinkUrl = STORAGE_CLIENT_API + bucketName + "/o?prefix=";
  });

  $window.addEventListener("beforeunload", function(e) {
    if(getActivePendingOperations().length > 0) {
      (e || window.event).returnValue = $scope.leavePageMessage;

      return $scope.leavePageMessage;
    }
  });

  $scope.isTrashFolder = function() {
    return $scope.fileListStatus.folder && $scope.fileListStatus.folder.indexOf("--TRASH--/") === 0;
  };

  $scope.showYourFiles = function() {
    $state.go("main.company-folders",
      { folderPath: "", companyId: $stateParams.companyId });
  };

  $scope.showTrash = function() {
    $state.go("main.company-folders",
      { folderPath: "--TRASH--/", companyId: $stateParams.companyId });
  };

  $("#deleteForm").submit(function(event) {
    event.preventDefault();
    $scope.deleteButtonClick();
  });

  $scope.isDisabledDownloadButton = function() {
    return ($scope.filesDetails.checkedCount === 0 && $scope.filesDetails.folderCheckedCount === 0) || $scope.filesDetails.localFiles === true;
  };

  $scope.isDisabledCopyUrlButton = function() {
    return $scope.isTrashFolder() || 
           ($scope.filesDetails.checkedCount + $scope.filesDetails.folderCheckedCount === 0 || 
            $scope.filesDetails.checkedCount + $scope.filesDetails.folderCheckedCount > 1) ||
           $scope.filesDetails.localFiles === true;
  };

  $scope.isDisabledTrashButton = function() {
    return ($scope.filesDetails.checkedCount < 1 && $scope.filesDetails.folderCheckedCount < 1) ||
           $scope.filesDetails.localFiles === true;
  };

  $scope.isDisabledRestoreButton = function() {
    return ($scope.filesDetails.checkedCount < 1 && $scope.filesDetails.folderCheckedCount < 1);
  };

  $scope.isDisabledDeleteButton = function() {
    return ($scope.filesDetails.checkedCount < 1 && $scope.filesDetails.folderCheckedCount < 1);
  };

  $scope.downloadButtonClick = function() {
    downloadSvc.downloadFiles(getSelectedFiles(), bucketName, 100);
  };

  $scope.deleteButtonClick = function() {
    $scope.confirmDeleteFilesAction();
  };

  $scope.trashButtonClick = function() {
    $scope.processFilesAction("trash");
  };

  $scope.restoreButtonClick = function() {
    $scope.processFilesAction("restore");
  };

  $scope.removePendingOperation = function(file) {
    var position = $scope.pendingOperations.indexOf(file);

    if(position >= 0) {
      $scope.pendingOperations.splice(position, 1);
    }
  };

  $scope.selectButtonClick = function() {
    var fileUrls = [], data = {};
    data.params = [];
    getSelectedFiles().forEach(function(file) {
      var copyUrl = file.kind === "folder" ? folderSelfLinkUrl + encodeURIComponent(file.name) : STORAGE_FILE_URL + bucketName + "/" + encodeURIComponent(file.name);
      fileUrls.push(copyUrl);
      data.params.push(copyUrl);
    });
    console.log("Message posted to parent window", fileUrls);
    $window.parent.postMessage(fileUrls, "*");
    gadgets.rpc.call("", "rscmd_saveSettings", null, data);
  };

  $scope.copyUrlButtonClick = function(size) {
    var copyFile = getSelectedFiles()[0];

    $modal.open({
      templateUrl: "partials/copy-url.html",
      controller: "CopyUrlCtrl",
      size: size,
      resolve: {
        params: function() {
          return  {
            copyFile: copyFile,
            bucketName: bucketName,
            folderSelfLinkUrl: folderSelfLinkUrl,
            STORAGE_FILE_URL: STORAGE_FILE_URL
          };
        }
      }
    });
  };

  $scope.confirmDeleteFilesAction = function() {
    $scope.shouldBeOpen = true;
    var selectedFileNames = getSelectedFiles().map(function(file) {
        return file.name;
    });
    var filesSelected = false;
    var foldersSelected = false;
    var message;

    selectedFileNames.forEach(function(val) {
      if (val.substr(-1) === "/") {
        foldersSelected = true;
      }
      else {
        filesSelected = true;
      }
    });

    if(filesSelected && foldersSelected) {
      message = "delete-files-folders";
    }
    else if(foldersSelected) {
      message = "delete-folders";
    }
    else {
      message = "delete-files";
    }

    message = "storage-client." + message + "-" + (selectedFileNames.length === 1 ? "singular" : "plural");

    $translate(message, { count: selectedFileNames.length }).then(function(confirmationMessage) {
      $scope.modalInstance = $modal.open({
        templateUrl: "partials/delete-modal.html",
        controller: "DeleteInstanceCtrl",
        windowClass: "modal-custom",
        resolve: {
          confirmationMessage: function() {
            return confirmationMessage;
          }
        }
      });

      $scope.modalInstance.result.then(function() {
        // do what you need if user presses ok
        $scope.processFilesAction("delete");
      }, function () {
        // do what you need to do if user cancels
        $log.info("Modal dismissed at: " + new Date());
        $scope.shouldBeOpen = false;
      });
    });
  };

  $scope.processFilesAction = function(action) {
    var selectedFiles = getSelectedFiles();
    var selectedFileNames = selectedFiles.map(function(file) {
        return file.name;
    });

    selectedFiles.forEach(function(file) {
      file.action = action;
      var pendingFileNames = $scope.pendingOperations.map(function(i){
        return i.name;
      });
      if(pendingFileNames.indexOf(file.name) === -1){
        $scope.pendingOperations.push(file);
      }
    });

    listSvc.removeFiles(selectedFiles);
    listSvc.resetSelections();
    $scope.isPOCollapsed = true;

    var apiMethod = "storage.files.delete";

    if(action === "trash") {
      apiMethod = "storage.trash.move";
    }
    else if(action === "restore") {
      apiMethod = "storage.trash.restore";
    }

    var requestParams = { "companyId": $stateParams.companyId, "files": selectedFileNames };

    requestSvc.executeRequest(apiMethod, requestParams)
      .then(function(resp) {
        if (!resp.result) {
          $scope.statusDetails.code = resp.code;

          if(resp.code === 403 && resp.message.indexOf("restricted-role") >= 0){
            $translate("storage-client.access-denied").then(function(msg) {
              $scope.statusDetails.message = msg;
            });
          } else {
            $translate("storage-client." + resp.message, { username: resp.userEmail }).then(function(msg) {
              $scope.statusDetails.message = msg;
            });
          }
          selectedFiles.forEach(function(file) {
            file.actionFailed = true;

            $scope.filesDetails.files.push(file);
          });

          listSvc.resetSelections();
        }
        else {
          // Removed completed pending operations
          for(var i = $scope.pendingOperations.length - 1; i >= 0; i--) {
            var file = $scope.pendingOperations[i];

            if(selectedFiles.indexOf(file) >= 0) {
              $scope.pendingOperations.splice(i, 1);
            }
          }
        }

        $scope.shouldBeOpen = false;
    });
  };

  function getSelectedFiles() {
    return $scope.filesDetails.files.filter(function(e) {
      return e.isChecked;
    });
  }

  function getActivePendingOperations() {
    return $scope.pendingOperations.filter(function(op) {
      return !op.failed;
    });
  }
}])
;
