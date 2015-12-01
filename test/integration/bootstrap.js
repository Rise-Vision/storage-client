/*global process */
"use strict";

var webdriver = require("selenium-webdriver"),
    UNCAUGHT_EXCEPTION = webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION;

var driver = new webdriver.Builder()
  .forBrowser("chrome")
  .build();

var helpers = require("../e2e/bootstrap-helpers.js")(driver);
driver.logMessage = helpers.logMessage;
driver.findAndClickWhenVisible = helpers.findAndClickWhenVisible;
driver.waitForSpinner = helpers.waitForSpinner;
driver.logAndSnap = helpers.logAndSnap;
driver.waitForTruthyScript = helpers.waitForTruthyScript;

driver.controlFlow().addListener(UNCAUGHT_EXCEPTION, function errorHandler(e) {
  helpers.logAndSnap("uncaught exception")();
  console.log(e.toString());
  console.log(webdriver.stacktrace.getStack(e));
  driver.quit().then(function() {process.exit(1);});
});

function connectToLocalhost(driver) {
  driver.logMessage("Connecting to local host");

  driver.get("http://localhost:8000/files/1234").then(function() {
    driver.logMessage("Retrying local host");
    return driver.wait(function() {
      return driver.executeScript(function() {
        return document.title.indexOf("Rise") !== -1;
      });
    },2000).then(null,function() {return connectToLocalhost(driver);});
  });
}

var filePaths = 
[
"../../web/js/fullscreen-value-it.js",
"../../web/js/modal/modal-it.js"
];

connectToLocalhost(driver);
driver.waitForSpinner();

filePaths.forEach(function(path) {
  helpers.includeTestFile(path);
});

driver.logMessage("done");
driver.quit();
