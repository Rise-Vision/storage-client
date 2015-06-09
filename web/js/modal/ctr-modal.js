"use strict";

angular.module("risevision.storage.modal", ["risevision.common.config", "risevision.storage.external"])
.controller("ModalWindowController", ["$scope", "CoreClientService", "$rootScope", "FileListService", "SpinnerService", "FULLSCREEN", "SELECTOR_TYPE",
function($scope, CoreClientService, $rootScope, FileListService, spinnerSvc, FULLSCREEN, SELECTOR_TYPE) {
  $scope.FULLSCREEN = FULLSCREEN;
  $scope.SELECTOR_TYPE = SELECTOR_TYPE;
  $scope.singleFileSelector = SELECTOR_TYPE === "single-file";
  $scope.multipleFileSelector = SELECTOR_TYPE === "multiple-file";
  $scope.singleFolderSelector = SELECTOR_TYPE === "single-folder";
  $scope.trialAvailable = false;

  if(!FULLSCREEN) {
    var loc = window.location.href;
    var filesPath = loc.match(/.*\/files\/(.{36}).*/);
    var companyId = filesPath ? filesPath[1] : "";

    CoreClientService.getCompany(companyId).then(function(company) {
      $scope.company = company.item;
    }, function() {
      $scope.company = { name: "" };
    });
    
    $rootScope.$emit("storage-client:company-id-changed", companyId);
    
    $rootScope.$on("subscription-status:changed", function (e, subscriptionStatus) {
      $scope.subscriptionStatus = subscriptionStatus;
      $scope.trialAvailable = subscriptionStatus.statusCode === "trial-available";
    });

    $scope.startTrial = function() {
      spinnerSvc.start();

      FileListService.startTrial().then(function() {
        spinnerSvc.stop();
        $rootScope.$emit("refreshSubscriptionStatus", "trial-available");
      }, function() {
        spinnerSvc.stop();
      });
    };
  }

  $scope.closeButtonClick = function() {
    gadgets.rpc.call("", "rscmd_closeSettings", null);
    window.parent.postMessage("close", "*");
  };
}]);
