"use strict";
angular.module("risevision.storage.files", 
  ["risevision.storage.gapi", "risevision.storage.common", "risevision.storage.services", 
   "risevision.storage.throttle", "risevision.storage.oauth", "risevision.common.config", 
   "risevision.common.i18n", "ui.router"])
.factory("FileListService", ["LocalFiles", "GAPIRequestService", "$stateParams", "$rootScope", "SpinnerService", "SELECTOR_TYPE", 
function (LocalFiles, requestor, $stateParams, $rootScope, spinnerSvc, SELECTOR_TYPE) {
  var svc = {};

  svc.filesDetails = {files: []
                     ,localFiles: false
                     ,checkedCount: 0
                     ,folderCheckedCount: 0
                     ,checkedItemsCount: 0};

  svc.statusDetails = {code: 202};
  svc.taggingCheckedItems = [];
  svc.checkedTagging = false;
  svc.singleFolderSelector = SELECTOR_TYPE === "single-folder";

  //on all state Changes do not hold onto checkedFiles list
  $rootScope.$on("$stateChangeStart", function() {
    svc.checkedTagging = false;
    svc.filesDetails.checkedCount = 0;
    svc.filesDetails.folderCheckedCount = 0;
    svc.filesDetails.checkedItemsCount = 0;
  });

  svc.addFile = function(newFile) {
    var currentFolder = $stateParams.folderPath ? decodeURIComponent($stateParams.folderPath) : "";
    var idx = newFile.name.indexOf("/", currentFolder.length);
    // Handles the case where a file inside a folder was added (since files are not visible, only adds the folder)
    var fileName = idx >= 0 ? newFile.name.substring(0, idx + 1) : newFile.name;
    var existingFileNameIndex;

    for (var i = 0, j = svc.filesDetails.files.length; i < j; i += 1) {
      if (svc.filesDetails.files[i].name === fileName) {
        existingFileNameIndex = i;
        break;
      }
    }

    if(idx >= 0) {
      if(!existingFileNameIndex) {
        svc.filesDetails.files.push({ name: fileName });
      }
    }
    else if (existingFileNameIndex) {
      svc.filesDetails.files.splice(existingFileNameIndex, 1, newFile);
    } else {
      svc.filesDetails.files.push(newFile);
    }
  };

  svc.getFileNameIndex = function(fileName) {
    for (var i = 0, j = svc.filesDetails.files.length; i < j; i += 1) {
      if (svc.filesDetails.files[i].name === fileName) {
        return i;
      }
    }
    return -1;
  };

  svc.resetSelections = function() {
    svc.filesDetails.files.forEach(function(val) {
      val.isChecked = false;
    });
    
    svc.filesDetails.checkedCount = 0;
    svc.filesDetails.folderCheckedCount = 0;
    svc.filesDetails.checkedItemsCount = 0;
  };

  svc.removeFiles = function(files) {
    var oldFiles = svc.filesDetails.files;
    var removedSize = 0;

    for(var i = oldFiles.length - 1; i >= 0; i--) {
      if(files.indexOf(oldFiles[i]) >= 0) {
        removedSize += parseInt(oldFiles[i].size);
        oldFiles.splice(i, 1);
      }
    }
  };

  svc.refreshFilesList = function () {
    var params = {companyId: $stateParams.companyId};

    if ($stateParams.folderPath) {
      params.folder = decodeURIComponent($stateParams.folderPath);
      svc.statusDetails.folder = params.folder;
    }
    else {
      svc.statusDetails.folder = "/";
    }

    svc.statusDetails.code = 202;

    if (!$stateParams.companyId) {
      svc.filesDetails.localFiles = true;
      return LocalFiles.query().$promise.then(function(resp) {
        return processFilesResponse({"files": resp, "code": 200});
      });
    }

    svc.filesDetails.localFiles = false;
    spinnerSvc.start();

    return requestor.executeRequest("storage.files.get", params)
    .then(function (resp) {
      if(svc.checkedTagging){
        resp.files.forEach(function(i){
          if(svc.taggingCheckedItems.indexOf(i.name) > -1){
            i.isChecked = true;
          }
          else {
            i.isChecked = false;
          }
        });
      }

      spinnerSvc.stop();
      return processFilesResponse(resp);
    }, function() {
      spinnerSvc.stop();
    });

    function fileIsFolder(file) {
      return file.name.substr(-1) === "/";
    }

    function processFilesResponse(resp) {
      var TRASH = "--TRASH--/";
      var parentFolder = decodeURIComponent($stateParams.folderPath);
      var parentFolderFound = false;

      resp.files = resp.files || [];

      for(var i = 0; i < resp.files.length; i++) {
        var file = resp.files[i];

        if(file.name === parentFolder) {
          parentFolderFound = true;
          file.currentFolder = true;
          delete file.size;
          delete file.updated;
          break;
        }
      }

      if(!parentFolderFound && $stateParams.folderPath) {
        resp.files.unshift({ name: parentFolder, currentFolder: true, size: "", updated: null });
      }

      svc.filesDetails.files = resp.files || [];
      svc.statusDetails.code = resp.code;

      if(svc.singleFolderSelector) {
        svc.filesDetails.files = svc.filesDetails.files.filter(function(f) { return fileIsFolder(f); });
      }

      if(!$stateParams.folderPath || !parentFolder || parentFolder === "/") {
        svc.filesDetails.files.splice(1, 0, { name: TRASH, size: "", updated: null });
      }
        
      return resp;
    }
  };

  return svc;
}]);
