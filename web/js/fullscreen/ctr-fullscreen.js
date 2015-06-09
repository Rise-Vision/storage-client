/*jshint scripturl:true*/

"use strict";

angular.module("risevision.storage.fullscreen", ["risevision.storage.common", "risevision.common.config", "ui.router"])
.controller("FullScreenController", ["$scope", "$rootScope", "$http", "$location", "$timeout", "userState", "$state", "FileListService", "SpinnerService", "FULLSCREEN",
    function($scope, $rootScope, $http, $location, $timeout, userState, $state, FileListService, spinnerSvc, FULLSCREEN) {
  $scope.FULLSCREEN = FULLSCREEN;

  if(FULLSCREEN) {
    $scope.userState = userState;
    $scope.trialAvailable = false;
    $scope.filesDetails = FileListService.filesDetails;
    $scope.navOptions = [];
    $scope.isCollapsed = true;
    
    $scope.$on("risevision.user.authorized", function () {
      if(!$scope.userSignedIn) {
        spinnerSvc.start();
      }
  
      $scope.userSignedIn = true;
      $scope.trialAvailable = false;
    });
  
    $scope.$on("risevision.user.signedOut", function () {
      $scope.userSignedIn = false;
      $scope.trialAvailable = false;

      // Redirect to root when the user signs out
      $location.path("/");
    });
    
    $rootScope.$on("subscription-status:changed", function (e, subscriptionStatus) {
      $scope.subscriptionStatus = subscriptionStatus;
      $scope.trialAvailable = subscriptionStatus.statusCode === "trial-available";
    });

    $scope.startTrial = function() {
      if($scope.userSignedIn) {
        spinnerSvc.start();

        FileListService.startTrial().then(function() {
          spinnerSvc.stop();
          $rootScope.$emit("refreshSubscriptionStatus", "trial-available");
        }, function() {
          spinnerSvc.stop();
        });
      }
      else {
        $scope.userState.authenticate(true);
      }
    };
    
    $scope.$watch(function () {
        return userState.getSelectedCompanyId();
      }, 
      function (companyId) {
        if(companyId) {
          var loc = window.location.href;
          var filesPath = loc.match(/.*\/files\/.{36}\/(.*)/);
  
          filesPath = filesPath ? filesPath[1] : "";
          var idxId = filesPath.indexOf("?cid=");
  
          if(idxId === 0) {
            $state.go("main.company-root", { companyId: companyId });
          }
          else {
            $state.go("main.company-folders", { folderPath: filesPath.substr(0, idxId === -1 ? filesPath.length : idxId),
                                                companyId: companyId });
          }
          
          $rootScope.$emit("storage-client:company-id-changed", companyId);
          spinnerSvc.stop();
        }
      });
    }
  }
])
;
