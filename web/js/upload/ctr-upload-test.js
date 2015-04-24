"use strict";

/* global sinon */

describe("UploadController", function() {
    var UploadController, scope;
    var FileUploader = {}, UploadURIService = {};
    var $stateParams = {};
    
    beforeEach(module("risevision.storage.upload"));

    beforeEach(function() {
      module(function($provide) {
        $provide.factory("XHRFactory", function() {
          return {
            get: function() {
              return {
                upload: function() {

                },
                open: function() {

                },
                setRequestHeader: function() {

                },
                send: function() {
                  this.status = 200;
                  this.onload();
                }
              };
            }
          };
        });
      });

      inject(function ($controller, $rootScope, $injector) {
        var $httpBackend = $injector.get("$httpBackend");

        $httpBackend.whenGET(/\.*/).respond(200, {});
        FileUploader = $injector.get("FileUploader");
        $stateParams = {};

        UploadURIService = {
          getURI: function(file) {
            return {
              then: function(cb) {
                cb(file.name);

                return {
                  then: function(ignore, cb) {
                    cb();
                  }
                };
              }
            };
          }
        };

        var FileListService = {
          addFile: function() {

          }
        };

        var $translate = function(key) {
          return {
            then: function(cb) {
              if(Array.isArray(key)) {
                var map = {};
                for(var i = 0; i < key.length; i++) {
                  map[key[i]] = key[i];
                }
                cb(map);
              }
              else {
                cb(key);
              }
            }
          };
        };

        scope = $rootScope.$new();

        UploadController = $controller("UploadController", {
            $scope: scope, $rootScope: $rootScope, $stateParams: $stateParams,
            FileUploader: FileUploader, UploadURIService: UploadURIService,
            FileListService: FileListService, 
            $translate: $translate, STORAGE_UPLOAD_CHUNK_SIZE: 1024 });
      });
    });

    it("should be defined", function() {
        expect(UploadController).to.exist;
    });

    it("should add uploader callbacks", function() {
        expect(FileUploader.onAfterAddingFile).to.exist;
        expect(FileUploader.onBeforeUploadItem).to.exist;
        expect(FileUploader.onCancelItem).to.exist;
        expect(FileUploader.onCompleteItem).to.exist;

        expect(UploadURIService.getURI).to.exist;
    });

    it("should invoke onBeforeUploadItem", function() {
        var file1 = { name: "test1.jpg", size: 200, slice: function() {} };
        var onBeforeUploadItem = sinon.spy();

        FileUploader.onBeforeUploadItem = onBeforeUploadItem;
        FileUploader.addToQueue([ file1 ]);

        expect(onBeforeUploadItem.called).to.be.true;
    });

    it("should upload to the correct folder", function() {
        var file1 = { name: "test1.jpg", size: 200, slice: function() {} };
        var onBeforeUploadItem = sinon.spy();

        $stateParams.folderPath = "test-folder/";

        var onAfterAddingFile = sinon.spy(FileUploader, "onAfterAddingFile");

        FileUploader.onBeforeUploadItem = onBeforeUploadItem;
        FileUploader.addToQueue([ file1 ]);

        expect(onBeforeUploadItem.called).to.be.true;
        expect(file1.name).to.equal("test1.jpg");
        expect(onAfterAddingFile.getCall(0).args[0].file.name).to.equal("test-folder/test1.jpg");
    });

    it("should invoke onCompleteItem", function() {
        var file1 = { name: "test1.jpg", size: 200, slice: function() {} };
        var onCompleteItem = sinon.spy(FileUploader, "onCompleteItem");

        FileUploader.addToQueue([ file1 ]);

        var args = onCompleteItem.getCall(0).args;

        expect(onCompleteItem.called).to.be.true;
        expect(args[0].isSuccess).to.be.true;
    });
});
