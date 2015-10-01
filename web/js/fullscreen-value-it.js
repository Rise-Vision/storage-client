"use strict";

var promise = require("selenium-webdriver").promise;

function verifyFullscreenValue(expectedValue) {
  var angular = window.angular ||
                document.querySelector("iframe").contentWindow.angular;

  return angular.element("#storage-content").injector().invoke(["FULLSCREEN",
    function(FULLSCREEN) {
      return FULLSCREEN === expectedValue;
    }
  ]);
}

module.exports = function(driver) {
  driver.get("http://localhost:8000");
  var fullscreenPromise = driver.executeScript(verifyFullscreenValue, true)
  .then(function(resp) {
    if (!resp) {return promise.rejected("fullscreen value is not true");}
  });
  driver.wait(fullscreenPromise, 2000, "fullscreen");
  driver.logMessage("fullscreen value is true");

  driver.get("http://localhost:8000/test/integration/iframe-test.html");
  var iframePromise = driver.executeScript(verifyFullscreenValue, false)
  .then(function(resp) {
    if (!resp) {return promise.rejected("fullscreen value is not false");}
  });
  driver.wait(iframePromise , 2000, "iframe");
  driver.logMessage("fullscreen value is false in iframe");
};

