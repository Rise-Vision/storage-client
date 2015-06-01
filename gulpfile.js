"use strict";

/*jshint node: true */
/* global concat: true */

// ************************
// * Rise Vision Storage UI *
// * build script         *
// ************************

// Include gulp

var env = process.env.NODE_ENV || "dev",
    gulp = require("gulp"),
    // Include Our Plugins
    karma = require("gulp-karma"),
    jshint = require("gulp-jshint"),
    usemin = require("gulp-usemin"),
    uglify = require("gulp-uglify"),
    sourcemaps = require("gulp-sourcemaps"),
    replace = require("gulp-replace"),
    gutil = require("gulp-util"),
    sass = require("gulp-sass"),
    minifyCSS = require("gulp-minify-css"),
    concat = require("gulp-concat"),
    clean = require("gulp-clean"),
    rename = require("gulp-rename"),
    express = require("gulp-express"),
    path = require("path"),

    //Test files
    testFiles = [
      "web/components/jQuery/dist/jquery.js",
      "web/components/q/q.js",
      "web/components/underscore/underscore.js",
      "web/components/spin.js/spin.js",
      "web/components/angular/angular.js",
      "web/components/angular-bootstrap/ui-bootstrap-tpls.js",
      "web/components/angular-ui-router/release/angular-ui-router.js",
      "web/components/angular-resource/angular-resource.js",
      "web/components/angular-sanitize/angular-sanitize.js",
      "web/components/angular-translate/angular-translate.js",
      "web/components/angular-sanitize/angular-sanitize.min.js",
      "web/components/angular-spinner/angular-spinner.js",
      "web/components/angular-touch/angular-touch.min.js",
      "web/components/angular-local-storage/dist/angular-local-storage.js",
      "web/js/config/locales_local.js",
      "web/components/rv-common-i18n/dist/i18n.js",
      "web/components/ngstorage/ngStorage.min.js",
      "web/components/ng-biscuit/dist/ng-biscuit.min.js",
      "web/components/ng-csv/src/ng-csv/ng-csv.js",
      "web/components/rv-common-svg/dist/svg.js",
      "web/components/ng-gapi-loader/src/js/svc-gapi.js",
      "web/components/rv-common-header/dist/js/common-header.js",
      "web/components/rv-loading/loading.js",
      "web/components/checklist-model/checklist-model.js",
      "web/components/rv-widget-settings-ui-core/dist/widget-settings-ui-core.js",
      "web/components/rv-subscription-status/dist/js/subscription-status.js",
      "web/components/angular-mocks/angular-mocks.js",

      "web/js/config/local.js",
      "web/js/common/services.js",
      "web/js/common/filters.js",
      "web/js/common/directives.js",
      "web/js/common/svc-spinner.js",
      "web/js/common/date-format-util.js",
      "web/js/cookies/svc-cookie-tester.js",
      "web/js/cookies/ctr-cookie-tester.js",
      "web/js/oauth/svc-oauth-status.js",
      "web/js/gapi/gapi-client-load.js",
      "web/js/gapi/svc-gapi-auth.js",
      "web/js/gapi/svc-gapi-requestor.js",
      "web/js/throttle/svc-callout-closing-service.js",
      "web/js/throttle/ctr-container.js",
      "web/js/fullscreen/ctr-fullscreen.js",
      "web/js/external/svc-core-client.js",
      "web/js/modal/ctr-modal.js",
      "web/js/download/svc-file-retriever.js",
      "web/js/download/svc-download.js",
      "web/js/buttons/ctr-top-buttons.js",
      "web/js/buttons/ctr-files-buttons.js",
      "web/js/buttons/ctr-copy-url-modal.js",
      "web/js/upload/svc-upload-request.js",
      "web/js/upload/svc-file-upload.js",
      "web/js/upload/ctr-upload.js",
      "web/js/files/svc-file-list.js",
      "web/js/files/ctr-files.js",
      "web/js/files/ctr-new-folder.js",
      "web/js/subscription/ctr-subscription.js",
      "web/js/publicread/svc-public-read.js",
      "web/js/publicread/ctr-public-read.js",
      "web/js/app.js",

      "web/js/**/*-test.js"
    ],

    appJSFiles = [
      "web/js/**/*.js",
      "test/**/*.js"
    ],

    sassFiles = [
      "web/scss/**/*.scss"
    ],

    cssFiles = [
      "web/css/**/*.css",
      "web/components/rv-common-style/dist/css/*.min.css",
      "web/components/rv-subscription-status/dist/css/subscription-status.min.css"
    ],

    imgFiles = [
      "web/img/**/*"
    ],

    htmlFiles = [
      "web/*.html"
    ],

    viewFiles = [
      "web/partials/**/*",
    ],

    fileFiles = [
      "web/files/**/*"
    ],

    fontFiles = [
      "web/components/rv-common-style/dist/fonts/*"
    ],

    localeFiles = [
      "web/components/rv-common-i18n/dist/locales/**/*"
    ],

    iconFiles = [
      "web/*.ico"
    ],

    libFiles = [
      "web/lib/**/*"
    ],

    dataFiles = [
        "web/data/**/*"
    ];

gulp.task("clean", function() {
  return gulp.src("dist", {read: false})
    .pipe(clean({force: true}));
});

gulp.task("lint", function() {
  return gulp.src(appJSFiles)
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"))
    .pipe(jshint.reporter("fail"));
});

gulp.task("watch", function() {
    return gulp.watch([appJSFiles, sassFiles], ["lint", "sass"]);
});

gulp.task("html", ["clean", "lint"], function () {
  return gulp.src(htmlFiles)
  .pipe(usemin())
  .pipe(env === "prod" ? replace("rise-common-test", "rise-common") : gutil.noop())
  .pipe(env === "prod" ? replace("rvaviewer-test", "rvashow2") : gutil.noop())
  .pipe(gulp.dest("dist/"));
});

gulp.task("uglify", ["html"], function() {
  return gulp.src("dist/script/*")
  .pipe(sourcemaps.init())
  .pipe(uglify())
  .pipe(sourcemaps.write("./"))
  .pipe(gulp.dest("dist/script"));
});

gulp.task("view", ["clean"], function() {
  return gulp.src(viewFiles)
    .pipe(gulp.dest("dist/partials"));
});


gulp.task("files", ["clean"], function() {
  return gulp.src(fileFiles)
    .pipe(gulp.dest("dist/files"));
});

gulp.task("fonts", ["clean"], function() {
  return gulp.src(fontFiles)
    .pipe(gulp.dest("dist/fonts"));
});

gulp.task("locales", ["clean"], function() {
  return gulp.src(localeFiles)
    .pipe(gulp.dest("dist/locales"))
    .pipe(gulp.dest("web/locales"));
});

gulp.task("img", ["clean"], function() {
  return gulp.src(imgFiles)
    .pipe(gulp.dest("dist/img"));
});

gulp.task("icons", ["clean"], function() {
  return gulp.src(iconFiles)
    .pipe(gulp.dest("dist"));
});

gulp.task("data", ["clean"], function() {
    return gulp.src(dataFiles)
        .pipe(gulp.dest("dist/data"));
});

gulp.task("sass", function () {
    return gulp.src(sassFiles)
      .pipe(sass({
        errLogToConsole: true
      }))
      .pipe(env === "prod" ? replace("rise-common-test", "rise-common") : gutil.noop())
      .pipe(gulp.dest("web/css"));
});

gulp.task("css", ["clean", "sass"], function () {
  return gulp.src(cssFiles)
    .pipe(minifyCSS({keepBreaks:true}))
    .pipe(concat("all.min.css"))
    .pipe(env === "prod" ? replace("rise-common-test", "rise-common") : gutil.noop())
    .pipe(gulp.dest("dist/css"));
});

gulp.task("lib", ["clean"], function() {
  return gulp.src(libFiles)
    .pipe(gulp.dest("dist/lib"));
});


/* Task: config
 * Copies configuration file in place based on the current
   environment variable (default environment is dev)
*/
gulp.task("config", function() {
  gulp.src(["./web/js/config/" + env + ".js"])
    .pipe(rename("config.js"))
    .pipe(gulp.dest("./web/js/config"));

  gulp.src(["./web/js/config/locales_" + env + ".js"])
    .pipe(rename("locales_config.js"))
    .pipe(gulp.dest("./web/js/config"));
});

gulp.task("build", ["clean", "config", "html", "uglify", "view", "files", "img", "css", "fonts", "locales", "icons", "lib", "data"]);


gulp.task("test", function() {
  gulp.src(testFiles).pipe(karma({
    configFile: "test/karma.conf.js",
    action: "watch"
  }));
});

gulp.task("test-ci", function() {
  // Be sure to return the stream
  return gulp.src(testFiles)
    .pipe(karma({
      configFile: "test/karma-jenkins.conf.js",
      action: "run"
    }))
    .on("error", function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
});

gulp.task("watch-dev", function() {
  gulp.watch(sassFiles, ["sass"]);
});

gulp.task("watch-dist", function() {
  gulp.watch(htmlFiles, ["html"]);
  gulp.watch(viewFiles, ["view"]);
  gulp.watch(fileFiles, ["files"]);
  gulp.watch(imgFiles, ["img"]);
  gulp.watch(sassFiles, ["css"]);
  gulp.watch(localeFiles, ["locales"]);
});

gulp.task("server", ["sass", "watch-dev"], function() {
  express.run([path.join(__dirname, "server.js")], { env: { port: 8000, root: "/web" }});
});

gulp.task("server-dist", function() {
  express.run([path.join(__dirname, "server.js")], { env: { port: 8000, root: "/dist" }});
});

gulp.task("default", [], function () {
  console.log("\n***********************");
  console.log("* Tell me what to do: *");
  console.log("***********************");
  console.log("* gulp build          *");
  console.log("* gulp lint           *");
  console.log("* gulp watch          *");
  console.log("* gulp test           *");
  console.log("***********************\n");
  return true;
});
