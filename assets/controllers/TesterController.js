(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Tester
	///
	app.controller('TesterController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$rootScope', '$q', 'testerMgmt'
	];

	function controller($scope, $http, $rootScope, $q, testerMgmt) {
		var areaId = $rootScope.areaId;
		$scope.apply = testerMgmt.apply;
	}

}());
