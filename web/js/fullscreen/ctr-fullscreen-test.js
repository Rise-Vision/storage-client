describe("FullScreenController", function() {
    "use strict";

    beforeEach(module("risevision.storage.fullscreen"));

    var FullScreenController, scope; //, userState, usSpinnerService;

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();

        FullScreenController = $controller("FullScreenController"
            ,{ $scope: scope, userState: {}, usSpinnerService: {}, FileListService: {} });
    }));

    it("should be defined", function() {
        expect(FullScreenController).to.exist;
    });
});
