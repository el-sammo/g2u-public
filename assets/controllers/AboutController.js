(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: About
	///
	app.controller('AboutController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', 
		'delFeeMgmt', 'hoursMgr'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, 
		delFeeMgmt, hoursMgr
	) {
		var areaId = $rootScope.areaId;

		var dayMap = [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
		];

		var delHoursPromise = hoursMgr.getAllHours();
		
		delHoursPromise.then(function(delHours) {
			var hoursArr = [];
			var counter = 0;
			delHours.forEach(function(day) {
				var windows = [];
				day.forEach(function(thisWindow) {
					windows.push(thisWindow.start, thisWindow.end);
				});
				hoursArr.push({'dotw': dayMap[counter], windows: windows});
				counter ++;
			});

			$scope.days = hoursArr;

			$scope.tierOne = '$' + delFeeMgmt[0];
			$scope.tierTwo = '$' + delFeeMgmt[1];
			$scope.tierThree = '$' + delFeeMgmt[2];
			$scope.addRestaurant = '$' + (delFeeMgmt[3]).toFixed(2);
		
			$http.get('/areas/' + areaId).then(function(res) {
				$scope.area = res.data;
			}).catch(function(err) {
				console.log('AboutController: areas ajax failed');
				console.error(err);
			});
		});
	}

}());
