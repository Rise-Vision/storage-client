"use strict";

angular.module("risevision.storage", [
  "ui.router",
  "ui.bootstrap",
  "risevision.widget.common.subscription-status",
  "risevision.storage.modal",
  "risevision.common.config",
  "risevision.common.header",
  "risevision.common.loading",
  "risevision.common.i18n",
  "risevision.storage.buttons.top",
  "risevision.storage.buttons.files",
  "risevision.storage.cookie",
  "risevision.storage.directives",
  "risevision.storage.download",
  "risevision.storage.filters",
  "risevision.storage.files",
  "risevision.storage.fullscreen",
  "risevision.storage.publicread",
  "risevision.storage.services",
  "risevision.storage.subscription",
  "risevision.storage.throttle",
  "risevision.storage.upload"
]);

angular.module("risevision.common.config")
.config(["$provide", function($provide) {
  var href = window.location.href;
  var fullscreen = (window === window.top) && (href.indexOf("selector-type") === -1);

  console.log("storage app config invoked!", window.location.href);

  $provide.value("FULLSCREEN", fullscreen);

  if(href.indexOf("selector-type=multiple-file") !== -1) {
    $provide.value("SELECTOR_TYPE", "multiple-file");
  }
  else if(href.indexOf("selector-type=single-folder") !== -1) {
    $provide.value("SELECTOR_TYPE", "single-folder");
  }
  else if(!fullscreen) {
    $provide.value("SELECTOR_TYPE", "single-file");
  }
  else {
    $provide.value("SELECTOR_TYPE", "");
  }
}]);

angular.module("risevision.storage")
.config(["$compileProvider", function($compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript):/);
}])
.config(["$urlMatcherFactoryProvider", function($urlMatcherFactoryProvider) {
  $urlMatcherFactoryProvider.type("NotEncodedURL", {
    encode: function valToString(val) { return val !== null ? val.toString() : val; },
    decode: function valFromString(val) { return val !== null ? val.toString() : val; },
    is: angular.isString,
    pattern: /\/.*/
  });
}])
.config(["$urlRouterProvider", "$stateProvider", "$locationProvider",
function($urlRouterProvider, $stateProvider, $locationProvider) {
  $locationProvider.html5Mode({
    enabled: true
  });

  if(window.location.href.indexOf("/files") === -1) {
    $urlRouterProvider.otherwise("/");
  }

  $stateProvider
  .state("main", {
    url: "/files",
    templateUrl: "partials/main.html"
  })
  .state("main.local", {
    url: "/local",
    templateUrl: "partials/file-items.html"
  })
  .state("main.company-root", {
    url: "/:companyId",
    templateUrl: "partials/file-items.html"
  })
  .state("main.company-folders", {
    url: "/:companyId/{folderPath:NotEncodedURL}",
    templateUrl: "partials/file-items.html"
  });
}])
;
