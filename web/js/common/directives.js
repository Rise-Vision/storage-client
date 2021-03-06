"use strict";

angular.module("risevision.storage.directives", [])
.directive("focusMe", ["$timeout", function($timeout) {
  return {
    scope: { trigger: "@focusMe" },
    link: function(scope, element) {
      scope.$watch("trigger", function() {
        $timeout(function() {
          element[0].focus();
        });
      });
    }
  };
}])
.directive("analytics", function() {
  return {
    restrict: "E",
    scope: {
      analyticsAccountId: "="
    },
    link: function() {
      /*jshint -W030 */
      /*jshint -W033 */
      (function(i,s,o,g,r,a,m){i.GoogleAnalyticsObject=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,"script","//www.google-analytics.com/analytics.js","ga");
      /*jshint +W030 */
      /*jshint +W033 */
    },
    controller: ["$scope", "$window", function($scope, $window) {
      $scope.$watch("analyticsAccountId", function(newId) {
        if (newId) {
          $window.ga("create", $scope.analyticsAccountId, "auto");
        }
      });
    }]
  };
})
// Fixes default formatter issue on Angular Bootstrap Datepicker
.directive("datepickerPopup", function () {
  return {
    restrict: "EAC",
    require: "ngModel",
    link: function(scope, element, attr, controller) {
      //remove the default formatter from the input directive to prevent conflict
      controller.$formatters.shift();
    }
  };
})
;
