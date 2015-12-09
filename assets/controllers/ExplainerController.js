(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Explainer Controller
	///

	app.controller('ExplainerController', controller);
	
	controller.$inject = [
		'$scope', 'args', '$http', '$routeParams', '$modal', 'orderMgmt',
		'$rootScope', '$q', 'layoutMgmt', 'delFeeMgmt',
		'clientConfig'
	];

	function controller(
		$scope, args, $http, $routeParams, $modal, orderMgmt,
		$rootScope, $q, layoutMgmt, delFeeMgmt,
		clientConfig
	) {

		if(args.things) {
			$scope.things = args.things;
		}
		
		if(args.delFee) {
			$scope.delFee = args.delFee;
		}
		
		$scope.formattedDelFee = '$' + $scope.delFee;

		var rests = [];
		$scope.things.forEach(function(thing) {
			if(rests.indexOf(thing.restaurantName) < 0) {
				rests.push(thing.restaurantName);
			}
		});

		$scope.addRests = 0;
		if(rests.length > 1) {
			$scope.addRests = rests.length - 1;
		}

		$scope.addRestsFee = $scope.addRests * delFeeMgmt[3];

		$scope.restNames = '';
		var firstName = true;
		rests.forEach(function(rest) {
			if(firstName) {
				$scope.restNames = rest;
				firstName = false;
			} else {
				if(rests.indexOf(rest) < $scope.addRests) {
					$scope.restNames = $scope.restNames + ', ' + rest;
				} else {
					$scope.restNames = $scope.restNames + ' and ' + rest;
				}
			}
		})

		$scope.calcFee = $scope.delFee - $scope.addRestsFee;

		$scope.formattedAddRestsFee = '$' + ($scope.addRestsFee).toFixed(2);

		$scope.tierOneFee = '$' + (delFeeMgmt[0]).toFixed(2);
		$scope.tierTwoFee = '$' + (delFeeMgmt[1]).toFixed(2);
		$scope.tierThreeFee = '$' + (delFeeMgmt[2]).toFixed(2);

	}

}());
