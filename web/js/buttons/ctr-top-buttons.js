"use strict";

angular.module("risevision.storage.buttons.top", [])
.controller("TopButtonsController",
["$scope", "$rootScope", "$stateParams", "$window", "$modal", "$log", "$timeout", "$filter", "FileListService",
"GAPIRequestService", "STORAGE_FILE_URL", "DownloadService", "$q", "$translate", "$state", "FULLSCREEN", 
function ($scope,$rootScope, $stateParams, $window, $modal, $log, $timeout, $filter, listSvc, requestSvc,
          STORAGE_FILE_URL, downloadSvc, $q, $translate, $state, FULLSCREEN) {
  $scope.storageFull = FULLSCREEN;
  $scope.showCloseButton = !$scope.storageFull;

  $scope.filesDetails = listSvc.filesDetails;
  $scope.fileListStatus = listSvc.statusDetails;
  $scope.statusDetails = { code: 200, message: "" };
  $scope.leavePageMessage = "";

  $scope.isTrashFolder = function() {
    return $scope.fileListStatus.folder && $scope.fileListStatus.folder.indexOf("--TRASH--/") === 0;
  };

  $("#deleteForm").submit(function(event) {
    // prevent default browser behaviour
    event.preventDefault();
    $scope.deleteButtonClick();
  });

  $scope.showSelectorFileSearch = function() {
    $scope.activeSearch = !$scope.activeSearch;

    $timeout(function() {
      $("#selectorQuery").focus();
    }, 0);
  };

  $scope.hideSelectorFileSearch = function() {
    $scope.query = "";
    $scope.activeSearch = !$scope.activeSearch;
  };

  $scope.newFolderButtonClick = function(size) {
    $scope.shouldBeOpen = true;

    $scope.modalInstance = $modal.open({
      templateUrl: "partials/new-folder-modal.html",
      controller: "NewFolderCtrl",
      size: size
    });

    $scope.modalInstance.result.then(function () {
      //do what you need if user presses ok
    }, function () {
      // do what you need to do if user cancels
      $log.info("Modal dismissed at: " + new Date());
    });
  };
}])
;
