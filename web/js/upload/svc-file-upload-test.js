/*jshint expr:true */

describe("Services: FileUploader", function() {
  "use strict";

  beforeEach(module("risevision.storage.upload"));

  beforeEach(module(function ($provide) {
    $provide.service("$q", function() {
      return Q;
    });
  }));
  
  beforeEach(function() {
  	inject(function($injector) {
      var $httpBackend = $injector.get("$httpBackend");
      $httpBackend.whenGET(/\.*/).respond(200, {});
  	});
  });

  function getUploadService() {
    var uploader;
    inject(["FileUploader", function(FileUploader) {
      uploader = FileUploader;
    }]);

    uploader.onAfterAddingFile = function() {
      return Q.resolve();
    };
    uploader.onBeforeUploadItem = function() {};
    uploader.onCancelItem = function() {};
    uploader.onCompleteItem = function() {};

    return uploader;
  }

  it("should exist", function (done) {
    inject(function(FileUploader) {
      expect(FileUploader).be.defined;
      done();
    });
  });

  it("should add two regular files to the queue", function (done) {
    var uploader = getUploadService();

    uploader.addToQueue([{ name: "test1.txt", size: 200, type: "text" }]);
    expect(uploader.queue.length).to.equal(1);
    expect(uploader.queue[0].file.name).to.equal("test1.txt");
    uploader.addToQueue([{ name: "test2.txt", size: 200, type: "text" }]);
    expect(uploader.queue.length).to.equal(2);

    done();
  });

  it("should add one file inside a folder to the queue", function (done) {
    var uploader = getUploadService();

    uploader.addToQueue([{ name: "test1.txt", webkitRelativePath: "folder/test1.txt", size: 200, type: "text" }]);
    expect(uploader.queue.length).to.equal(1);
    expect(uploader.queue[0].file.name).to.equal("folder/test1.txt");

    done();
  });
  
  it("multiple files should be enqueued asynchronously after the first", function (done) {
    var uploader = getUploadService();

    uploader.addToQueue([{ name: "test1.txt", webkitRelativePath: "folder/test1.txt", size: 200, type: "text" },
      { name: "test2.txt", webkitRelativePath: "folder/test2.txt", size: 200, type: "text" },
      { name: "test3.txt", webkitRelativePath: "folder/test3.txt", size: 200, type: "text" }]);

    expect(uploader.queue.length).to.equal(1);
    expect(uploader.queue[0].file.name).to.equal("folder/test1.txt");
    
    setTimeout(function() {
      expect(uploader.queue.length).to.equal(3);
      expect(uploader.queue[1].file.name).to.equal("folder/test2.txt");

      done();      
    }, 10);
  });
});
