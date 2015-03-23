"use strict";
function getService(serviceName) {
  var injectedService;
  inject([serviceName, function(serviceInstance) {
    injectedService = serviceInstance;
  }]);
  return injectedService;
}

describe("Services: Download", function() {
  beforeEach(module("risevision.storage.download"));
  beforeEach(module(function($provide) {
    $provide.service("$window", function() {
      var svc = {};
      svc.filesDownloaded = [];
      svc.location = {assign: function(file) {
        svc.filesDownloaded.push(file);
      }};
      return svc;
    });
    $provide.service("GAPIRequestService", function() {
      var svc = {};

      svc.executeRequest = function(endpoint, params) {
        return {
          then: function(cb) {
            cb({ message: "Invoked: " + endpoint, result: true, params: params });
          }
        };
      };
      return svc;
    });
    $provide.service("$stateParams", function() {
      var svc = { companyId: "dummy-id"};

      return svc;
    });
    $provide.service("$translateStaticFilesLoader", function() {
      return function() {
        return {
          then: function() {}
        };
      };
    });
  }));

  it("should exist", function() {
    var dlSvc = getService("DownloadService");
    expect(dlSvc.downloadFiles).to.exist;
  });

  it("should not download on 0 length array", function() {
    var dlSvc = getService("DownloadService");
    var $timeout = getService("$timeout");
    var $window = getService("$window");
    dlSvc.downloadFiles([]);
    $timeout.flush();
    expect($window.filesDownloaded.length).to.equal(0);
  });

  it("should download 2 files given two files and a folder", function() {
    var dlSvc = getService("DownloadService");
    var $timeout = getService("$timeout");
    var $window = getService("$window");
    dlSvc.downloadFiles([{name: "t1"},{name: "t2"},{name: "t1/"}]);
    $timeout.flush();
    expect($window.filesDownloaded.length).to.equal(1);
    $timeout.flush();
    expect($window.filesDownloaded.length).to.equal(2);
    $timeout.flush();
    expect($window.filesDownloaded.length).to.equal(2);
  });
});
