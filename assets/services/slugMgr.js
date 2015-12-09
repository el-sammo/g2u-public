(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Slug Management
	///

	app.factory('slugMgr', service);
	
	service.$inject = [
		'$rootScope', '$http', '$q'
	];
	
	function service(
		$rootScope, $http, $q
	) {
		var slug;

		var service = {
			randomSlug: function() {
				if(slug) return $q.when(slug);

				var areaId = $rootScope.areaId;

				// retrieve restaurants
				return $http.get('/restaurants/byAreaId/' + areaId).then(function(res) {
					if(slug) return slug;

					// if restaurants ajax succeeds...
					var restLength = res.data.length;

					var randRestId = res.data[Math.floor((Math.random() * restLength))].id;

					return $http.get('/menus/byRestaurantId/' + randRestId);

				}).then(function(res) {
					if(slug) return slug;

					// if menus ajax succeeds...
					var menuLength = res.data.length;

					slug = res.data[Math.floor((Math.random() * menuLength))].slug;
					return slug;

				}).catch(function(err) {
					// if restaurants ajax fails...
					console.error('randomSlug error during ajax call:', err);
				});
			}
		};

		return service;
	}

}());
