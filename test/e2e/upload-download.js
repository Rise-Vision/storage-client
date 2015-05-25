/* global process */
"use strict";
var openFileSync = require("fs").openSync,

uploadFilePath = process.cwd() + "/package.json",
HOME = process.env.HOME,
downloadFilePath = HOME + "/e2e-downloads/storage-client/package.json",

locators = {
  "fileInputElement": {"id": "upload-files"},
  "fileRow": {"css": "tr.clickable-row td span.file"},
  "downloadButton": {"css": "i.fa-cloud-download"}
};

module.exports = function(driver) {
  driver.logMessage("locating file input element");
  driver.findElement(locators.fileInputElement).sendKeys(uploadFilePath);
  driver.findAndClickWhenVisible(locators.fileRow);
  driver.findAndClickWhenVisible(locators.downloadButton);
  driver.wait(function fileDownloadCheck() {
    try {
      openFileSync(downloadFilePath, "r");
    } catch (e) {
      return false;
    }
    return true;
  }, 15000, "file download");
};
