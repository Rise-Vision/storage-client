"use strict";
angular.module("risevision.storage.upload", ["risevision.storage.gapi", "risevision.storage.oauth", "risevision.storage.files", "risevision.common.config"])
.factory("UploadURIService", ["$q", "GAPIRequestService", "OAuthStatusService", "$stateParams", "$interpolate", "$translate", "$window",
function uploadURIService ($q, gapiRequestor, OAuthService, $stateParams, $interpolate, $translate, $window) {
  var svc = {};

  var uriFailed = "storage-client.upload-uri-request-failed";
  var uriFailedMail = "storage-client.upload-uri-request-failed-mail";
  var accessDenied = "storage-client.access-denied";
  var inactiveSubscription = "storage-client.upload-inactive-subscription";
  var verifyCompany = "storage-client.upload-verify-company";

$translate([uriFailed, uriFailedMail, inactiveSubscription, verifyCompany, accessDenied], { username: "{{username}}" }).then(function(values) {
    uriFailed = values[uriFailed];
    uriFailedMail = $interpolate(values[uriFailedMail]);
    inactiveSubscription = $interpolate(values[inactiveSubscription]);
    verifyCompany = $interpolate(values[verifyCompany]);
    accessDenied = values[accessDenied];
  });

  svc.getURI = function getURI(file) {
    if (!$stateParams.companyId || !file.name) {
      return $q.reject("Invalid Params");
    }

    return OAuthService.getAuthStatus()
    .then(function() {
      var gapiPath = "storage.getResumableUploadURI";
      var params = {"companyId": $stateParams.companyId,
                    "fileName": encodeURIComponent(file.name),
                    "fileType": file.type,
                    "origin": $window.location.origin};
      return gapiRequestor.executeRequest(gapiPath,params);
    })
    .then(function(resp) {
      if (resp.result === false) {
        if(resp.message === "upload-inactive-subscription") {
          resp.message = inactiveSubscription({ username: resp.userEmail });
        }
        else if(resp.message === "upload-verify-company") {
          resp.message = verifyCompany({ username: resp.userEmail });
        }
        else if(resp.code === 403){
          console.log("getResumableUploadURI 403 error", file, resp);
          resp.message = accessDenied;
        }
        else {
          console.log("getResumableUploadURI generic error", file, resp);
          resp.message = resp.userEmail ? uriFailedMail({ username: resp.userEmail })
                                        : uriFailed;          
        }
        return $q.reject(resp.message);
      } else {
        return resp.message;
      }
    })
    .then(null, function(resp) {
      return $q.reject(typeof(resp) === "string" ? resp : "An error ocurred attempting to begin an upload. Please try again.");
    });
  };

  svc.notifyGCMTargetsChanged = function(files) {
    return gapiRequestor.executeRequest("storage.notifyGCMTargetsChanged", { companyId: $stateParams.companyId, targets: files });
  };

  return svc;
}]);
