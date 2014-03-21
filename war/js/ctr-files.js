"use strict"

mediaLibraryApp.controller("FileListCtrl", ["$scope", "$rootScope", "$routeParams", "$filter", "apiStorage", "apiAuth", "MediaFiles", "LocalFiles", 
	function ($scope, $rootScope, $routeParams, $filter, apiStorage, apiAuth, MediaFiles, LocalFiles) {

	var MEDIA_LIBRARY_URL = 'http://commondatastorage.googleapis.com/';

	$rootScope.bucketName = 'risemedialibrary-' + $routeParams.companyId;
	$rootScope.bucketUrl = MEDIA_LIBRARY_URL + $rootScope.bucketName + '/';
	$scope.mediaFiles = [];
	$rootScope.requireBucketCreation = false;
	
	$scope.orderByAttribute = 'key';
	$scope.reverseSort = false;
	
    $scope.$on("userCompany.loaded", function (event) {

    	updateAuthStatus();

    });
    
//	$rootScope.updateList();

//  $scope.$on("storageApi.loaded", updateAuthStatus);
//	updateAuthStatus();
	
    function updateAuthStatus() {
        $scope.authStatus = apiAuth.authStatus;
        
        if ($scope.mediaFiles.length == 0) {
        	$rootScope.updateList();
        }
    };
    
	$rootScope.updateList = function() {
        
		if ($scope.authStatus !== 1) {
            return;
        }
        
		if ($routeParams.companyId) {

			MediaFiles.query({companyId: $routeParams.companyId}, function(response) {
				onGetFiles(response);
			});

		}
		else {

			$scope.mediaFiles = LocalFiles.query(function(mediaFiles) {

				$rootScope.setTermsCheckbox(true);
				$rootScope.actionsDisabled = true;

				$rootScope.librarySize = getLibrarySize(mediaFiles);

			});

		}
	};
	
	function onGetFiles(response) {
//		$scope.phonesGroupBy4 = $filter('groupBy')(phones, 4);

		if (response.status == 200) {  

			$rootScope.setTermsCheckbox(true);
			$rootScope.actionsDisabled = false;

			$scope.mediaFiles = response.mediaFiles;
			$rootScope.librarySize = getLibrarySize($scope.mediaFiles);

		}
		// Authentication failed
		else if (response.status == 403 || response.status == 401 || response.status == 400) {

			$rootScope.authenticationError = true;

		}
		// Bucket not found
		else if (response.status == 404) {

			$rootScope.setTermsCheckbox(true);
			$rootScope.actionsDisabled = false;
			$rootScope.requireBucketCreation = true;

		}
		// Media Library feature not enabled
		else if (response.status == 412) {
		
			$rootScope.requireBucketCreation = true;
			$rootScope.setTermsCheckbox(false);

		}
		
	}
	
	$scope.$watch('mediaFiles', function(items) {

		var checkedCount = 0;

		items.forEach(function(item) {
			if (item.checked) {
				checkedCount++;
			}
		});

		$rootScope.$broadcast('CheckedCountChange', checkedCount);		

	}, true);

	$scope.$watch('selectAll', function(v) {

	    for ( var i = 0; i < $scope.mediaFiles.length; ++i ) {
	        $scope.mediaFiles[ i ].checked = v;
	    }

	});

	$rootScope.$on('FileSelectAction', function(event, file) {

		if (!file) {

		  for ( var i = 0; i < $scope.mediaFiles.length; ++i ) {
			  if ($scope.mediaFiles[ i ].checked) {
				  file = $scope.mediaFiles[ i ];
			  }
		  }
	
		}

		if (file) {
			var fileUrl = $rootScope.bucketUrl + file.key;
			var data = { params: fileUrl };
			gadgets.rpc.call('', 'rscmd_saveSettings', null, data);

		}

	});

	$rootScope.$on('FileDeleteAction', function(event) {

		var selectedFiles = new Array();

		for ( var i = 0; i < $scope.mediaFiles.length; ++i ) {
			if ($scope.mediaFiles[ i ].checked) {
				selectedFiles.push($scope.mediaFiles[ i ].key);
			}
		}

		if (confirm('Are you sure you want to delete the ' + selectedFiles.length + ' files selected?')) {

			apiStorage.deleteFiles($routeParams.companyId, selectedFiles).then(onGetFiles);
			
//			$http({
//
//				url: 'deleteFiles',
//				method: 'POST',
//				data: selectedFiles,
//				params:{companyId:$routeParams.companyId},
//				headers: {'Content-Type': 'application/octet-stream'}
//
//			}).success(function (data, status, headers, config) {
//			
//				if (data.status == 200) {
//					$scope.mediaFiles = data.mediaFiles;
//				}
//		
//			}).error(function (data, status, headers, config) {
//				
//				$scope.status = status;
//
//			});
		
		}

	});

	function getLibrarySize(mediaFiles) {

		var size = 0;
		for ( var i = 0; i < mediaFiles.length; ++i ) {
			size += mediaFiles[ i ].size;
		}

		return size;

	}
	
}

]);
