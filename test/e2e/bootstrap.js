/*global process */
"use strict";

var webdriver = require("selenium-webdriver"),
    args = require("./bootstrap-args.js"),
    chrome = require("selenium-webdriver/chrome"),
    chromeOptions = new chrome.Options(),
    UNCAUGHT_EXCEPTION = webdriver.promise.ControlFlow.EventType.UNCAUGHT_EXCEPTION;

chromeOptions.setChromeBinaryPath("/usr/bin/chromium");
chromeOptions.addArguments("--disable-web-security");
chromeOptions.setUserPreferences(
{"download": 
  {"default_directory": process.env.HOME + "/e2e-downloads/storage-client",
   "type": 1,
   "prompt_for_download": false}
});

var driver = new webdriver.Builder()
  .forBrowser("chrome")
  .setChromeOptions(chromeOptions)
  .build();

var helpers = require("./bootstrap-helpers.js")(driver);
driver.waitForSpinner = helpers.waitForSpinner;

driver.controlFlow().addListener(UNCAUGHT_EXCEPTION, function errorHandler(e) {
  helpers.logAndSnap("uncaught exception")();
  console.log(e.toString());
  console.log(webdriver.stacktrace.getStack(e));
  driver.quit().then(function() {process.exit(1);});
});

require("./storage-sign-in.js")(driver, args.LOCAL, args.USER, args.PASSWORD);
helpers.waitForSpinner("storage-sign-in");

var filePaths = 
[
"../../web/js/buttons/folder-create-e2e.js",
"./upload-download.js",
"../../web/js/tagging/tagging-modal-popup.js",
"../../web/js/buttons/file-trash-e2e.js",
"../../web/js/buttons/file-restore-trash-e2e.js",
"../../web/js/buttons/folder-move-trash-e2e.js",
"../../web/js/buttons/folder-delete-e2e.js",
"../../web/js/modal/modal-e2e.js"
];

filePaths.forEach(function(path) {
  helpers.includeTestFile(path);
});

driver.controlFlow().execute(helpers.logAndSnap("done"));
driver.quit();
