"use strict";
describe("ModalWindowController", function() {
  beforeEach(module("risevision.storage.modal"));

  var ModalWindowController
     ,scope = {};

  beforeEach(module(function ($provide) {
    $provide.service("CoreClientService", function() {
      var svc = {};
      svc.getCompany = function() {
        return new Q({ id: 1, name: "" });
      };

      return svc;
    });
  }));

  beforeEach(inject(function($controller) {
    ModalWindowController = $controller("ModalWindowController"
                                       ,{$scope: scope, FileListService: {}, SpinnerService: {}});
  }));

  it("should be defined", function() {
    expect(ModalWindowController).to.exist;
  });

  it("should should provide a modal close function ", function() {
    expect(scope.closeButtonClick).to.exist;
  });
});
