"use strict";

var fs = require("fs"),
until = require("selenium-webdriver").until,
promise = require("selenium-webdriver").promise;

module.exports = function(driver) {
  var obj = {};

  obj.logAndSnap = function logAndSnap(msg) {
    return function() {
      driver.takeScreenshot().then(function(data) {
        var base64Data = data.replace(/^data:image\/png;base64,/,"");
        fs.writeFile(msg.replace(/ /g, "-") + ".png", base64Data, "base64",
        function(err) {
          if(err) {console.log(err);}
        });
      });
      console.log(msg);
    };
  };

  obj.includeTestFile = function loadTestFile(filepath) {
    obj.logMessage(filepath);
    require(filepath)(driver);
  };

  obj.logMessage = function logMessage(msg) {
    driver.controlFlow().execute(function(){console.log(msg);});
  };

  obj.waitForSpinner = function waitForSpinner() {
    obj.logMessage("Waiting for spinner");
    var spinnerLocator = {css: "div.spinner-backdrop"};
    driver.wait(until.elementLocated(spinnerLocator), 15000, "spinner");
    var spinner = driver.findElement(spinnerLocator);
    driver.wait(until.elementIsNotVisible(spinner), 15000, "wait for spinner");
  };

  obj.waitForTruthyScript = 
  function waitForTruthyScript(domScriptFunction, timelimitMillis, errorMsg) {
    return driver.controlFlow().execute(function() {
      var startMillis = Date.now();

      return check();

      function check() {
        return driver.executeScript(domScriptFunction)
        .then(function(resp) {
          if (Date.now() - startMillis > 5000) {return promise.rejected(errorMsg);}

          if (!resp) {
            driver.sleep(500);
            return check();
          }
        });
      }
    });
  };

  obj.findAndClickWhenVisible = function findAndClickWhenVisible(selector) {
    var deferUntilElementIsClickable = promise.defer();

    driver.wait(until.elementsLocated(selector), 15000, "locate elements: " + JSON.stringify(selector))
    .then(function() {
      clickUntilSuccessful(selector);
      return driver.wait(deferUntilElementIsClickable.promise, 9000, "clickable");
    });

    function clickUntilSuccessful(selector) {
      promise.createFlow(function(flow) {
        tryClicks(0);

        function tryClicks(idx) {
          flow.execute(function() {
            driver.findElements(selector).then(function(els) {
              if (idx === els.length) {idx = 0;}
              console.log("clicking " + JSON.stringify(selector) + "[" + idx + "]");
              return els[idx].click();
            }).then(function clicked() {
              deferUntilElementIsClickable.fulfill();
            }, function failedToClick(e) {
              console.log("failed to click: " + e.name);
              flow.timeout(500);
              tryClicks(idx + 1);
            });
          });
        }
      });
    }
  };

  return obj;
};
