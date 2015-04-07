"use strict";
angular.module("risevision.storage.tagging")
.controller("TaggingCtrl", ["$scope", "$modalInstance", "TaggingService", "$filter", "$q",
    "FileListService", "localDatastore",
    function($scope, $modalInstance, taggingSvc, $filter, $q, listSvc, localData) {

  $scope.timelineTagCount =  function(){
    var timelineCount = 0;
    $scope.selectedFiles.forEach(function(i){
      var timelineFound = i.tags.filter(function(i2){
        return i2.type === "TIMELINE";
      });
      timelineCount += timelineFound.length;
    });

    return timelineCount;
  };
  $scope.accessDenied = taggingSvc.errorHandle;
  $scope.selectedFiles = taggingSvc.selected.files;
  $scope.noTimeline = false;
  $scope.tagGroups = taggingSvc.tagGroups;
  $scope.availableLookupTags = taggingSvc.available.lookupTags;
  $scope.selectedLookupTags = taggingSvc.selected.lookupTags;
  $scope.selectedFreeformTags = taggingSvc.selected.freeformTags;
  $scope.showMainTagView = true;
  $scope.waitForResponse = false;
  $scope.clearLookupDisable = taggingSvc.tagGroups.lookupTags.length === 0;
  $scope.clearFreeformDisable = taggingSvc.tagGroups.freeformTags.length === 0;
  $scope.justAddedTimeline = true;
  $scope.clearTimelineDisable = (!taggingSvc.justAddedTimeline) && taggingSvc.tagGroups.timelineTag === null && !($scope.selectedFiles.length > 1 &&
  ($scope.tagGroups.timelineTag === undefined ||
  $scope.tagGroups.timelineTag === null) && $scope.noTimeline === false && $scope.timelineTagCount() > 0);
  $scope.showLookupEditView = false;
  $scope.showFreeformEditView = false;
  $scope.showTimelineEditView = false;

  $scope.hstep = 1;
  $scope.mstep = 15;
  $scope.ismeridian = true;
  $scope.dateFormat = "dd-MMM-yyyy";
  $scope.dateOptions = {
    formatYear: "yy",
    formatMonth: "MMM",
    startingDay: 1,
    showWeeks:"false"
  };

  $scope.clearTimeline = function(){
    $scope.selectedTimeline = {
      duration: 60,
      pud: "false",
      trash: "false",
      carryon: "false",
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      setTime: "false",
      setDate: "false",
      timelineRecurrence: "false"
    };
  };

  $scope.loadExistingTimeline = function(){
    $scope.timelineTagObj = {
      duration: taggingSvc.tagGroups.timelineTag.values[0].duration,
      pud: taggingSvc.tagGroups.timelineTag.values[0].pud,
      trash: taggingSvc.tagGroups.timelineTag.values[0].trash,
      carryon: taggingSvc.tagGroups.timelineTag.values[0].carryon,
      startDate: taggingSvc.tagDateStringToDate(taggingSvc.tagGroups.timelineTag.values[0].startDate),
      endDate: taggingSvc.tagDateStringToDate(taggingSvc.tagGroups.timelineTag.values[0].endDate),
      startTime: taggingSvc.tagTimeStringToDate(taggingSvc.tagGroups.timelineTag.values[0].startTime),
      endTime: taggingSvc.tagTimeStringToDate(taggingSvc.tagGroups.timelineTag.values[0].endTime),
      timelineRecurrence: (taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions === undefined || taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions === null ||
      taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions === "null") ? "false" : "true"
    };

    $scope.timelineTagObj.setDate = $scope.timelineTagObj.startDate ? "true" : "false";
    $scope.timelineTagObj.setTime = $scope.timelineTagObj.startTime ? "true" : "false";

    if (taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions !== undefined &&
      taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions !== null &&
      taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions !== "null") {
      $scope.timelineTagObj.recurrenceType = taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions.recurrenceType;
      $scope.timelineTagObj.recurrenceAbsolute = taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions.recurrenceAbsolute;
      $scope.timelineTagObj.recurrenceFrequency = taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions.recurrenceFrequency;
      $scope.timelineTagObj.recurrenceDayOfMonth = taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions.recurrenceDayOfMonth;
      $scope.timelineTagObj.recurrenceWeekOfMonth = taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions.recurrenceWeekOfMonth;
      $scope.timelineTagObj.recurrenceDayOfWeek = taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions.recurrenceDayOfWeek;
      $scope.timelineTagObj.recurrenceMonthOfYear = taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions.recurrenceMonthOfYear;
      $scope.timelineTagObj.daySelection  = taggingSvc.tagGroups.timelineTag.values[0].recurrenceOptions.recurrenceDaysOfWeek;
    }
  };

  $scope.minDate = new Date();

  if(taggingSvc.selected.timelineTag === undefined || taggingSvc.selected.timelineTag === null){
    $scope.clearTimeline();
  } else {
    $scope.loadExistingTimeline();
  }

  $scope.names = ["Daily", "Weekly", "Monthly", "Yearly"];
  $scope.durations = [{text: "Seconds", value: "false" }, {text:"Play Until Done", value: "true"}];

  $scope.optionsWeek = taggingSvc.options.week;
  $scope.optionsDay = taggingSvc.options.day;
  $scope.optionsMonth = taggingSvc.options.month;

  $scope.defaultRecurrence = function(){
    $scope.selectedTimeline.recurrenceType = "daily";
    $scope.selectedTimeline.recurrenceFrequency = 1;
    $scope.selectedTimeline.recurrenceAbsolute = "true";
    $scope.selectedTimeline.recurrenceDayOfMonth = 1;
    $scope.selectedTimeline.recurrenceWeekOfMonth = 0;
    $scope.selectedTimeline.recurrenceDayOfWeek = 0;
    $scope.selectedTimeline.recurrenceMonthOfYear = 0;
  };

  $scope.switchPUD = function(){
    $scope.selectedTimeline.pud = ($scope.selectedTimeline.pud === "true") ? "false" : "true";
  };
  $scope.resetRecurrences = function(name){
    $scope.selectedTimeline.recurrenceType = name;
    $scope.selectedTimeline.daySelection = [];
  };

  $scope.initDates = function() {
    if($scope.selectedTimeline.setDate === "true" && ($scope.selectedTimeline.startDate === undefined || $scope.selectedTimeline.startDate === null)){
      $scope.selectedTimeline.startDate = new Date();
    } else {
      $scope.selectedTimeline.startDate = null;
      $scope.selectedTimeline.endDate = null;
    }
  };

  $scope.initTimes = function() {
    if($scope.selectedTimeline.setTime === "true" && ($scope.selectedTimeline.startTime === undefined || $scope.selectedTimeline.startTime === null)){
      var startT = new Date();
      var endT = new Date();
      startT.setHours(8);
      startT.setMinutes(0);
      endT.setHours(20);
      endT.setMinutes(0);
      $scope.selectedTimeline.startTime = startT;
      $scope.selectedTimeline.endTime = endT;
    } else {
      $scope.selectedTimeline.startTime = null;
      $scope.selectedTimeline.endTime = null;
    }
  };

  $scope.toggleSelection = function(dayName){
    var idx = $scope.selectedTimeline.daySelection.indexOf(dayName.toLowerCase().substring(0,3));

    //is currently selected
    if(idx > -1){
      $scope.selectedTimeline.daySelection.splice(idx,1);
    }

    //is newly selected
    else{
      $scope.selectedTimeline.daySelection.push(dayName.toLowerCase().substring(0,3));
    }
  };

  $scope.openDatePicker = function($event,opened) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope[opened] = true;
  };

  $scope.toggleMode = function() {
    $scope.ismeridian = ! $scope.ismeridian;
  };

  $scope.addToSelectedLookupTag = function(tag){
    taggingSvc.addToSelectedLookupTag(tag);

    changedLookupAndValidate();
  };
  $scope.removeFromSelectedLookupTag = function(tag){

    taggingSvc.removeFromSelectedLookupTag(tag);

    changedLookupAndValidate();
  };

  $scope.refreshMainList = function(){
    var promise = $q.defer();

    listSvc.refreshFilesList().then(function(){
      localData.loadLocalData().then(function() {
        promise.resolve();
      });
    });

    return promise.promise;
  };

  $scope.saveChangesFromView =function(){
    $scope.waitForResponse = true;
    var defer = $q.defer();
    if($scope.showLookupEditView){
      taggingSvc.saveChangesToTags(taggingSvc.selected.lookupTags, "LOOKUP").then(function(){
        (taggingSvc.errorHandle) ? defer.reject() : defer.resolve();
      });
    }
    if($scope.showFreeformEditView){
      taggingSvc.saveChangesToTags($scope.selectedFreeformTags, "FREEFORM").then(function(){
        (taggingSvc.errorHandle) ? defer.reject() : defer.resolve();
      });
    }
    if($scope.showTimelineEditView){
      taggingSvc.transformTimelineForSaving($scope.selectedTimeline);
      taggingSvc.saveChangesToTags(taggingSvc.selected.timelineTag, "TIMELINE").then(function(){
        (taggingSvc.errorHandle) ? defer.reject() : $scope.timelineTagObj = angular.copy($scope.selectedTimeline); defer.resolve();

      });

    }
    defer.promise.then(function(){
      $scope.refreshMainList().then(function(){
        taggingSvc.justAddedTimeline = true;
        $scope.clearTimelineDisable = (!taggingSvc.justAddedTimeline) && taggingSvc.tagGroups.timelineTag === null && !($scope.selectedFiles.length > 1 &&
        ($scope.tagGroups.timelineTag === undefined ||
        $scope.tagGroups.timelineTag === null) && $scope.noTimeline === false && $scope.timelineTagCount() > 0);
        $scope.resetView();
      });
    }, function(){
      $scope.accessDenied = taggingSvc.errorHandle;
      $scope.waitForResponse = false;
    });
  };

  $scope.refreshChanges = function(){
    var fileNames = $scope.selectedFiles.map(function(i){
      return i.name;
    });
    var filesWithTags = localData.getFilesWithTags().filter(function(i){
      return fileNames.indexOf(i.name) > -1;
    });

    taggingSvc.refreshSelection (filesWithTags, taggingSvc.command);
    
    $scope.tagGroups = taggingSvc.tagGroups;
    $scope.availableLookupTags = taggingSvc.available.lookupTags;
    $scope.selectedLookupTags = taggingSvc.selected.lookupTags;
    $scope.selectedFreeformTags = taggingSvc.selected.freeformTags;
  };

  $scope.clearAllInvalidLookupTags = function(){
    taggingSvc.clearAllInvalidLookupTags();
    changedLookupAndValidate();
  };

  $scope.clearAllLookupTags = function(){
    $scope.clearLookupDisable = true;
    if($scope.showMainTagView){
      taggingSvc.clearAllLookupTagsAndSave().then(function(){
        if (taggingSvc.errorHandle){
          $scope.accessDenied = taggingSvc.errorHandle;
          $scope.waitForResponse = false;
        } else{
          taggingSvc.selected.lookupTags = [];
          $scope.refreshMainList().then(function() {
            $scope.refreshChanges();
          });
        }
      });
    } else {
      taggingSvc.clearAllLookupTags();
      $scope.changedLookup = taggingSvc.tagGroups.lookupTags.length === taggingSvc.selected.lookupTags.length &&
      taggingSvc.tagGroups.lookupTags.every(function(v,i){ return v.name === taggingSvc.selected.lookupTags[i].name &&
        v.value === taggingSvc.selected.lookupTags[i].value;});
    }
  };

  $scope.lookupOnEnter = function(keyCode, list, tagQuery){
    if(keyCode === 13 && $scope.showLookupEditView){
      var filteredList = list.filter(function(i){
        var combinedString = i.name + i.value;
        return !tagQuery || combinedString.indexOf(tagQuery) > -1;
      });

      if(filteredList.length === 1){
        var maplist = list.map(function(i){
          return i.name + i.value;
        });

        var index = maplist.indexOf(filteredList[0].name + filteredList[0].value);
        taggingSvc.addToSelectedLookupTag(list[index]);
        $scope.saveChangesFromView();
      }
    }
  };

  $scope.freeformOnEnter = function(keyCode){
    if(keyCode === 13 && $scope.showFreeformEditView){
      $scope.saveChangesFromView();
    }
  };

  $scope.clearAllFreeFormTags = function(){
    $scope.clearFreeformDisable = true;
    if($scope.showMainTagView){
      taggingSvc.clearAllFreeformTagsAndSave().then(function(){
        if (taggingSvc.errorHandle){
          $scope.accessDenied = taggingSvc.errorHandle;
          $scope.waitForResponse = false;
        } else{
          $scope.refreshMainList();
        }
      });
    } else {
      taggingSvc.clearAllFreeformTags();
    }
  };

  $scope.clearAllTimelineTags = function(){
    $scope.clearTimelineDisable = true;
    $scope.noTimeline = true;
    if($scope.showMainTagView){
      taggingSvc.clearAllTimelineTagsAndSave().then(function(){
        if (taggingSvc.errorHandle){
          $scope.accessDenied = taggingSvc.errorHandle;
          $scope.waitForResponse = false;
        } else{
          $scope.refreshMainList();
        }
      });
      $scope.refreshChanges();
    }
  };

  $scope.editLookup = function(){
    localData.refreshConfigTags().then(function() {
      $scope.refreshChanges();
      var availableNameValuePairs = localData.availableNameValuePairs();

      $scope.waitForResponse = false;

      taggingSvc.selected.lookupTags.forEach(function(tag){
        if(availableNameValuePairs.indexOf(tag.name + tag.value) === -1){
          tag.invalid = true;
          $scope.invalidLookupTag = true;
        }
        else {
          tag.invalid = false;
        }
      });

      $scope.changedLookup =
        taggingSvc.tagGroups.lookupTags.length === taggingSvc.selected.lookupTags.length &&
        taggingSvc.tagGroups.lookupTags.every(function(v,i) {
          return v.name === taggingSvc.selected.lookupTags[i].name &&
                 v.value === taggingSvc.selected.lookupTags[i].value;
        });
  
      $scope.selectedLookupTags = taggingSvc.selected.lookupTags;
      $scope.showMainTagView = false;
      $scope.showLookupEditView = true;
    });
  };

  $scope.editTimeline = function(){
    $scope.waitForResponse = false;

    if(taggingSvc.tagGroups.timelineTag === undefined || taggingSvc.tagGroups.timelineTag === null){
      $scope.clearTimeline();
    } else{
      $scope.selectedTimeline = angular.copy($scope.timelineTagObj);
    }
    $scope.showMainTagView = false;
    $scope.showTimelineEditView = true;
  };

  $scope.editFreeform = function(){
    localData.refreshConfigTags().then(function() {
      $scope.refreshChanges();

      $scope.waitForResponse = false;
      $scope.showMainTagView = false;
      $scope.showFreeformEditView = true;
    });
  };

  $scope.resetView = function(){
    taggingSvc.errorHandle = false;
    $scope.accessDenied = taggingSvc.errorHandle;
    $scope.waitForResponse = false;
    $scope.tagQuery = "";
    $scope.refreshChanges();
    $scope.showMainTagView = true;
    $scope.showLookupEditView = false;
    $scope.showFreeformEditView = false;
    $scope.showTimelineEditView = false;
    $scope.clearLookupDisable = taggingSvc.tagGroups.lookupTags.length === 0;
    $scope.clearFreeformDisable = taggingSvc.tagGroups.freeformTags.length === 0;
  };

  $scope.ok = function() {
    $modalInstance.close();
  };

  $scope.cancel = function() {
    $scope.resetView();
    $modalInstance.dismiss("cancel");
  };

  function changedLookupAndValidate(){
    taggingSvc.tagGroups.lookupTags.sort(function(a, b){
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });

    taggingSvc.selected.lookupTags.sort(function(a, b){
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });

    $scope.changedLookup = taggingSvc.tagGroups.lookupTags.length === taggingSvc.selected.lookupTags.length &&
    taggingSvc.tagGroups.lookupTags.every(function(v,i){ return v.name === taggingSvc.selected.lookupTags[i].name &&
      v.value === taggingSvc.selected.lookupTags[i].value;});
    $scope.invalidLookupTag = taggingSvc.selected.lookupTags.some(function(i){
      return localData.availableNameValuePairs().indexOf(i.name + i.value) === -1;
    });
  }
}])
;
