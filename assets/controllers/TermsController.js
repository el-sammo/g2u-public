(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Terms
	///
	app.controller('TermsController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope'
	];

	function controller($scope, $http, $routeParams, $rootScope) {
	}

}());
