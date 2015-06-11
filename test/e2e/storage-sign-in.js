"use strict";

var until = require("selenium-webdriver").until;

module.exports = function(driver, LOCALCLIENT, LOCALSERVER, USER, PASSWORD) {
  var url = "http://storage.risevision.com",
  signInLocator = {"css": "button.sign-in"},
  spinnerLocator = {"css": "div.spinner-backdrop"},
  spinner,
  emailLocator = {"id": "Email"},
  passwordLocator = {"id": "Passwd"},
  googleSignInLocator = {"id": "signIn"},
  localApproveLocator = {"id": "submit_approve_access"},
  anyFolderLocator = {"css": "span.folder.ng-binding"},
  approveAccessLocator = {"id": "submit_approve_access"};

  if (LOCALSERVER) {
    driver.get("localhost:8888/_ah/login");
    driver.findElement({"id": "email"}).clear();
    driver.findElement({"id": "email"}).sendKeys(USER);
    driver.findElement({"css": "label[for='isAdmin']"}).click();
    driver.findElement({"id": "btn-login"}).click();
    LOCALCLIENT = true;
  }

  if (LOCALCLIENT) {
    url = "localhost:8000";
  }

  driver.get(url);
  driver.wait(until.elementLocated(spinnerLocator), 5000, "find spinner");
  spinner = driver.findElement(spinnerLocator);
  driver.wait(until.elementIsNotVisible(spinner), 15000, "wait for spinner");
  driver.findElement(signInLocator).click();

  driver.wait(until.elementLocated(emailLocator), 2000, "wait for email field");
  driver.sleep(500);
  driver.findElement(emailLocator).sendKeys(USER);
  driver.findElement(passwordLocator).sendKeys(PASSWORD);
  driver.findElement(googleSignInLocator).click();

  driver.sleep(3000);
  if(driver.findElements(approveAccessLocator).length > 0) {
    driver.findElement(approveAccessLocator).click();
  }

  if (LOCALCLIENT) {
    driver.wait(until.elementLocated(localApproveLocator), 4000, "approve");
    driver.wait(until.elementIsEnabled(driver.findElement(localApproveLocator)), 4000);
    driver.findElement(localApproveLocator).click();
  }

  driver.wait(until.elementLocated(anyFolderLocator), 25000, "files listed");
};
