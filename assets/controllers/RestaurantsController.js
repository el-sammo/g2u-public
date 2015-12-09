(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Restaurants
	///

	app.config(config);
	
	config.$inject = [
		'httpInterceptorProvider'
	];
	
	function config(httpInterceptorProvider) {
		httpInterceptorProvider.register(/^\/restaurants/);
	}


	app.controller('RestaurantsController', controller);
	
	controller.$inject = [
		'$rootScope', '$scope', '$http', '$routeParams', '$modal', '$location',
		'$window', '$q', 'uiGmapGoogleMapApi', 'orderMgmt', 'signupPrompter',
		'deviceMgr', 'slugMgr', 'restaurantsMgr', 'seo'
	];

	function controller(
		$rootScope, $scope, $http, $routeParams, $modal, $location, $window, $q,
		uiGmapGoogleMapApi, orderMgmt, signupPrompter, deviceMgr, slugMgr, 
		restaurantsMgr, seo
	) {
		if($location.path().match(/^\/$/) && ! deviceMgr.isBigScreen()) {
			$window.location.href = '/app/restaurants/';
		}

		signupPrompter.prompt();

		$scope.buildRestMenus = function(slug) {
			restaurantsMgr.getRestaurants().then(function(allRestaurants) {
				var addresses = [];

				$scope.restaurants = allRestaurants;
				$scope.restaurantId = allRestaurants[0].id;

				/**
				// TODO cheating with a hard-coded address and lat/lon
				var eight42 = [42.841915, -106.309904];

				var map;
				var elevator;
				var myOptions = {
					zoom: 1,
					center: new google.maps.LatLng(eight42[0], eight42[1]),
					mapTypeId: 'terrain'
				};
				map = new google.maps.Map($('#map_canvas')[0], myOptions);

				for (var x = 0; x < addresses.length; x++) {
					$.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address='+addresses[x]+'&sensor=false', null, function (data) {
						var p = data.results[0].geometry.location
						var latlng = new google.maps.LatLng(p.lat, p.lng);
						new google.maps.Marker({
							position: latlng,
							map: map
						});

					});
				}
				*/

				/*
				uiGmapGoogleMapApi.then(function(maps) {
					$scope.map = {
						center: {latitude: 42.841915, longitude: -106.309904},
						zoom: 12
					};

					$scope.markers = [];

					allRestaurants.forEach(function(restaurant) {
						restaurant.addresses.forEach(function(locAddress) {
						});
					});
				});
				*/

			});
			restaurantsMgr.getRestaurantBySlug(slug).then(function(restaurant) {
				restaurant || (restaurant = {});

				// Manage search engine optimization for restaurants
				seo.reset();
				seo.setTitle(restaurant.name);
				seo.setDescription(
					'Delivery from ' + restaurant.name + ' in ' + $rootScope.areaName
				);

				// Build and set SEO keywords
				seo.appendKeywords([
					restaurant.name,
					'delivery from ' + restaurant.name,
				]);

				if(restaurant.cuisine) {
					seo.appendKeywords(restaurant.cuisine);

					var split = restaurant.cuisine.split(' ');
					if(split.length > 1) {
						seo.appendKeywords(split);
					}
				}

				seo.appendKeywords([
					$rootScope.areaName,
					$rootScope.areaName + ' restaurant delivery',
					$rootScope.areaName + ' food delivery',
					'restaurant',
					'restaurant delivery',
					'food',
					'food delivery',
				]);

				$scope.displayRestaurant = restaurant;
				$scope.showRestaurant(restaurant.id);
			});
		};

		var slugPromise;
		if($routeParams.id) {
			slugPromise = $q.when($routeParams.id);
		} else {
			slugPromise = slugMgr.randomSlug();
		}

		slugPromise.then(function(slug) {
			$scope.buildRestMenus(slug);
		});

		$scope.imageUrl = '/images/';

		// retrieve and display restaurant data (including menus)
		$scope.showRestaurant = function(id) {
			$scope.restaurantId = id;
		};
	}

}());
