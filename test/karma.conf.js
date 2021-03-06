/* globals process: false */
"use strict";
module.exports = function(config){
  config.set({

    basePath : "../",

    frameworks: ["mocha", "chai", "chai-as-promised", "sinon-chai"],

    browsers : ["PhantomJS"],

    reporters: ["spec"],

    specReporter: {"maxLogLines": 5},

    plugins : [
            "karma-firefox-launcher",
            "karma-mocha",
            "karma-chai",
            "karma-chai-plugins",
            "karma-phantomjs-launcher",
            "karma-spec-reporter"
            ],

    // web server port
    port: process.env.E2E_PORT||9876,
    logLevel: config.LOG_INFO,

    // enable / disable colors in the output (reporters and logs)
    colors: true

  });
};
