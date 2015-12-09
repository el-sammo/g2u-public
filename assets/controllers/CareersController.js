(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Careers
	///
	app.controller('CareersController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', 'careersMgmt',
		'seo'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, careersMgmt, seo
	) {
		seo.setPage('careers');

		var areaId = $rootScope.areaId;

		$scope.apply = careersMgmt.apply;

		var p = $http.get('/areas/' + areaId);

		p.error(function(err) {
			console.log('CareersController: areas ajax failed');
			console.error(err);
		});

		p.then(function(res) {
			$scope.area = res.data;
		});

	}

}());
