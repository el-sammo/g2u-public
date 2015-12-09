(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Privacy
	///
	app.controller('PrivacyController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope'
	];

	function controller($scope, $http, $routeParams, $rootScope) {
	}

}());
