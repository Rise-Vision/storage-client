"use strict";

var gadgets = {
    rpc: {
        call: function() {}
    }
};

describe("FileListCtrl", function() {
    var $window;
    var FileListCtrl, scope;
    var FileListService;
    var invokedMethod = "";
    var postMessage;

    beforeEach(module("risevision.storage.files"));

    beforeEach(module(function ($provide) {
      $provide.service("GAPIRequestService", function() {
        var svc = {};
        svc.executeRequest = function() {
          var response = { code: 200 };
          return new Q(response);
        };
  
        return svc;
      });
  
      $provide.service("OAuthAuthorizationService", function() {
        return {
          authorize: function() {
            return new Q(true);
          }
        };
      });
    }));
    
    beforeEach(inject(function ($controller, $rootScope, _$window_, $injector) {
        var $httpBackend = $injector.get("$httpBackend");
        $httpBackend.whenGET(/\.*/).respond(200, {});

        FileListService = {};

        FileListService.filesDetails = {
                           files: [{ "name": "test/file1", "size": 5 }, 
                                   { "name": "test/file2", "size": 3 },
                                   { "name": "test/file3", "size": 8 },
                                   { "name": "test/", "size": 0 }]
                           ,localFiles: false
                           ,checkedCount: 0
                           ,folderCheckedCount: 0 };

        FileListService.statusDetails = { code: 200 };

        var modal = {};
    
        modal.open = function() {
          return {
          result: {
            then: function(confirmCallback, cancelCallback) {
            //Store the callbacks for later when the user clicks on the OK or Cancel button of the dialog
            this.confirmCallBack = confirmCallback;
            this.cancelCallback = cancelCallback;
            }
          },
          close: function( item ) {
            //The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
            this.result.confirmCallBack( item );
          },
          dismiss: function( type ) {
            //The user clicked cancel on the modal dialog, call the stored cancel callback
            this.result.cancelCallback( type );
          }
          };
        };
        
        var GAPIRequestService = {};
  
        GAPIRequestService.executeRequest = function (apiPath) {
          invokedMethod = apiPath;

          return {
            then: function() {
                return { code: 200, message: "" };
            }
          };
        };

        $window =  _$window_;
        scope = $rootScope.$new();

        postMessage = sinon.spy($window.parent, "postMessage");

        FileListCtrl = $controller("FileListCtrl", {
            $scope: scope, GAPIRequestService: GAPIRequestService,
                FileListService: FileListService, $modal: modal, DownloadService: {} });
      }));

    afterEach(function() {
      $window.parent.postMessage.restore();
    });

    it("should be defined", function() {
        expect(FileListCtrl).to.exist;
    });

    it("should post a message to its parent when a file is clicked", function() {
        var file = FileListService.filesDetails.files[0];
        var call = sinon.spy(gadgets.rpc, "call");

        scope.storageFull = false;
        scope.$emit("FileSelectAction", file);

        scope.$apply();

        expect(call.called).to.equal(true);

        // postMessage receives an array of file paths and a "*" as second parameter
        expect(postMessage.args[0][0].length).to.equal(1);
    });

    it("should test file is the current folder", function() {
        var file = FileListService.filesDetails.files[3];

        scope.currentDecodedFolder = "test/";
        
        expect(scope.fileIsCurrentFolder(file)).to.be.equal(true);
    });

    it("should test an item is a not folder", function() {
        var file = FileListService.filesDetails.files[0];
        
        expect(scope.fileIsFolder(file)).to.be.equal(false);
    });

    it("should test an item is a folder", function() {
        var file = FileListService.filesDetails.files[3];
        
        expect(scope.fileIsFolder(file)).to.be.equal(true);
    });

    it("should select all files and folders in storage full", function() {
        scope.storageFull = true;
        scope.selectAll = false;
        scope.selectAllCheckboxes();

        expect(scope.filesDetails.checkedCount).to.be.equal(3);
        expect(scope.filesDetails.folderCheckedCount).to.be.equal(1);
    });

    it("should select all files in multiple file selector", function() {
        scope.singleFileSelector = true;
        scope.selectAll = false;
        scope.selectAllCheckboxes();

        expect(scope.filesDetails.checkedCount).to.be.equal(3);
        expect(scope.filesDetails.folderCheckedCount).to.be.equal(0);
    });

    it("should deselect all files and folders", function() {
        scope.selectAll = true;
        scope.selectAllCheckboxes();

        expect(scope.filesDetails.checkedCount).to.be.equal(0);
        expect(scope.filesDetails.folderCheckedCount).to.be.equal(0);
    });
});
