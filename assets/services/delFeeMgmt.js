(function() {
	'use strict';

	var app = angular.module('app');

	app.factory('delFeeMgmt', service);
	
	service.$inject = [
		'$rootScope', '$http'
	];
	
	function service($rootScope, $http) {
		// [tierOne, tierTwo, tierThree, additional]
		// maps to
		// [
		// 	450 seconds or less, 
		// 	720 seconds or less but greater than 450 seconds,
		// 	greater than 720 seconds,
		// 	each additional restaurant
		// 	]
		var service = [7.95, 10.95, 13.95, 3.50];

		return service;
	}

}());
