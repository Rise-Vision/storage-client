"use strict";

angular.module("risevision.storage.files")
.controller("FileListCtrl",
["$scope", "$stateParams", "$modal", "$log", "$location", "FileListService",
 "OAuthAuthorizationService", "GAPIRequestService", "OAuthStatusService",
 "$window", "STORAGE_FILE_URL", "STORAGE_CLIENT_API", "$state", "$translate",
 "FULLSCREEN", "SELECTOR_TYPE", "calloutClosingService", "filterFilter", "$timeout", "DownloadService",
function ($scope, $stateParams, $modal, $log, $location, listSvc,
          OAuthAuthorizationService, requestSvc, OAuthStatusService,
          $window, STORAGE_FILE_URL, STORAGE_CLIENT_API, $state, $translate, FULLSCREEN, SELECTOR_TYPE,
          calloutClosingService, filterFilter, $timeout, DownloadService) {
  var bucketName = "risemedialibrary-" + $stateParams.companyId;
  var trashLabel;
  var lastClickTime = 0;

  $scope.$location = $location;
  $scope.isAuthed = true;
  $scope.filesDetails = listSvc.filesDetails;
  $scope.statusDetails = listSvc.statusDetails;
  $scope.bucketCreationStatus = {code: 202};
  $scope.currentDecodedFolder = $stateParams.folderPath ? 
                                decodeURIComponent($stateParams.folderPath) : undefined;
  $scope.activeFolderDownloads = DownloadService.activeFolderDownloads;
  $scope.storageFull = FULLSCREEN;
  $scope.selectorType = SELECTOR_TYPE;
  $scope.singleFileSelector = SELECTOR_TYPE === "single-file";
  $scope.multipleFileSelector = SELECTOR_TYPE === "multiple-file";
  $scope.singleFolderSelector = SELECTOR_TYPE === "single-folder";

  $translate("storage-client.trash").then(function(value) {
    trashLabel = value;
  });

  $scope.fileClick = function(file) {
    if($scope.fileIsFolder(file)) {
      var dblClickDelay = 300;
      var currentTime = (new Date()).getTime();

      if(currentTime - lastClickTime < dblClickDelay) {
        lastClickTime = 0;

        if($scope.fileIsFolder(file)) {
          $scope.$emit("FileSelectAction", file);
        }
      }
      else {
        lastClickTime = currentTime;

        // Use a small delay to avoid selecting a folder when the intention was navigating into it
        $timeout(function() {
          var currentTime = (new Date()).getTime();

          if(lastClickTime !== 0 && currentTime - lastClickTime >= dblClickDelay && !file.currentFolder && !$scope.fileIsTrash(file)) {
            if($scope.singleFolderSelector) {
              $scope.postFileToParent(file);
            }
            else if(!$scope.singleFileSelector && !$scope.multipleFileSelector) {
              $scope.fileCheckToggled(file);
            }
          }
        }, dblClickDelay);
      }
    }
    else if($scope.singleFileSelector) {
      $scope.$emit("FileSelectAction", file);
    }
    else {
      $scope.fileCheckToggled(file);
    }
  };

  $scope.dateModifiedOrderFunction = function(file) {
    return file.updated ? file.updated.value : "";
  };

	$scope.isTrashFolder = function(){
		return $stateParams.folderPath === "--TRASH--/";
	};

  $scope.isRootFolder = function(){
    return !$stateParams.folderPath || $stateParams.folderPath === "/";
  };

  $scope.login = function() {
    OAuthAuthorizationService.authorize().then(function() {
      $scope.isAuthed = true;
      listSvc.refreshFilesList();
    })
    .then(null, function(errResult) {
      console.log(errResult);
    });
  };

  $scope.fileNameOrderFunction = function(file){
    return file.name.replace("--TRASH--/", trashLabel).toLowerCase();
  };

  $scope.orderByAttribute = $scope.fileNameOrderFunction;

  $scope.fileExtOrderFunction = function(file) {
    return file.name.substr(-1) === "/" ?
           "Folder" :
      (file.name.split(".").pop() === file.name) ? "" : file.name.split(".").pop();
  };

  $scope.fileSizeOrderFunction = function(file) {
    return Number(file.size);
  };

  OAuthStatusService.getAuthStatus().then(function() {
    $scope.isAuthed = true;
    listSvc.refreshFilesList();
  }, function() { $scope.isAuthed = false; });

  // Hide file list for in app selector when no files and folders exist in root
  $scope.isFileListVisible = function() {
    if(!$scope.storageFull && (!$scope.currentDecodedFolder || $scope.currentDecodedFolder === "/")) {
      return $scope.filesDetails.files.filter(function(f) { 
        return !$scope.fileIsTrash(f) && !$scope.fileIsCurrentFolder(f);
      }).length > 0;
    }
    else {
      return true;
    }
  };
	
  $scope.fileCheckToggled = function(file) {
    // ng-click is processed before btn-checkbox updates the model
    var checkValue = !file.isChecked;

    file.isChecked = checkValue;

    if (file.name.substr(-1) !== "/") {
      $scope.filesDetails.checkedCount += checkValue ? 1 : -1;
    } else {
      $scope.filesDetails.folderCheckedCount += checkValue ? 1 : -1;
    }

    $scope.filesDetails.checkedItemsCount += checkValue ? 1 : -1;
  };

  $scope.selectAllCheckboxes = function(query) {
    var filteredFiles = filterFilter($scope.filesDetails.files, query);

    $scope.selectAll = !$scope.selectAll;

    $scope.filesDetails.checkedCount = 0;
    $scope.filesDetails.folderCheckedCount = 0;
    $scope.filesDetails.checkedItemsCount = 0;
    for ( var i = 0; i < $scope.filesDetails.files.length; ++i ) {
      var file = $scope.filesDetails.files[i];

      if ($scope.fileIsCurrentFolder(file) || 
          $scope.fileIsTrash(file) ||
          ($scope.fileIsFolder(file) && !($scope.storageFull || $scope.singleFolderSelector))) {
        continue;
      }

      file.isChecked = $scope.selectAll && filteredFiles.indexOf(file) >= 0;

      if (file.name.substr(-1) !== "/") {
        $scope.filesDetails.checkedCount += file.isChecked ? 1 : 0;
      } else {
        $scope.filesDetails.folderCheckedCount += file.isChecked ? 1 : 0;
      }

      $scope.filesDetails.checkedItemsCount += file.isChecked ? 1 : 0;
    }
  };

  $scope.cancelFolderDownload = function(folder)  {
    DownloadService.cancelFolderDownload(folder);
  };

  $scope.fileIsCurrentFolder = function(file) {
    return file.name === $scope.currentDecodedFolder;
  };

  $scope.fileIsFolder = function(file) {
    return file.name.substr(-1) === "/";
  };

  $scope.fileIsTrash = function(file) {
    return file.name === "--TRASH--/";
  };

  $scope.postFileToParent = function(file) {
    var folderSelfLinkUrl = STORAGE_CLIENT_API + bucketName +"/o?prefix=";
    var fileUrl = file.kind === "folder" ? folderSelfLinkUrl + encodeURIComponent(file.name) :
        STORAGE_FILE_URL + bucketName + "/" + encodeURIComponent(file.name);
    var data = { params: fileUrl };

    if (!$scope.storageFull) {
      console.log("Message posted to parent window", [fileUrl]);
      $window.parent.postMessage([fileUrl], "*");
      gadgets.rpc.call("", "rscmd_saveSettings", null, data);
    }
  };

  $scope.$on("FileSelectAction", function(event, file) {
    listSvc.checkedTagging = false;

    if ($scope.fileIsFolder(file)) {
      listSvc.resetSelections();

      if ($scope.fileIsCurrentFolder(file)) {
        var folderPath = $scope.currentDecodedFolder.split("/");
        folderPath = folderPath.length > 2 ?
                     folderPath.slice(0, -2).join("/") + "/" : "";
        $state.go(folderPath ? "main.company-folders" : "main.company-root",
                  {folderPath: folderPath, companyId: $stateParams.companyId});
      } else {
        $state.go("main.company-folders",
                  {folderPath: file.name, companyId: $stateParams.companyId});
      }
    } else {
      if (file.isThrottled) {
       file.showThrottledCallout = true;
       calloutClosingService.add(file);
       return;
      }

      $scope.postFileToParent(file);
    }
  });
}])
;
