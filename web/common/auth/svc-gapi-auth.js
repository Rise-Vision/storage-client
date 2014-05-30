"use strict";
angular.module("gapi-auth", ["common-config", "gapi"])
  .service("apiAuth", ["$interval", "$rootScope", "$q", "$http", "gapiLoader", "oauthAPILoader", 
    function apiAuthConstructor($interval, $rootScope, $q, $http, gapiLoader, oauthAPILoader) {

      var CLIENT_ID = "614513768474.apps.googleusercontent.com";
      var SCOPES = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";

      var self = this;

      this.checkAuth = function (silentCheck) {
        var deferred = $q.defer();
        gapiLoader.get().then(function (gApi) {
          gApi.auth.authorize({ client_id: CLIENT_ID, scope: SCOPES, immediate: silentCheck }, function (authResult) {
            deferred.resolve(authResult);
          });
        });
        return deferred.promise;
      };

      this.getUserCompanies = function () {
          var deferred = $q.defer();
          storeAPILoader.get().then(function (storeClient) {
            var request = storeClient.usercompanies.get({});
            request.execute(function (resp) {
              deferred.resolve(resp);
            });
          });
          return deferred.promise;
      };

      this.getProfile = function () {
        var deferred = $q.defer();
          oauthAPILoader.get().then(function (gApi) {
          var request = gApi.client.oauth2.userinfo.get({});
          request.execute(function (resp) {
            deferred.resolve(resp);
          });
        });
        return deferred.promise;
      };
}]);