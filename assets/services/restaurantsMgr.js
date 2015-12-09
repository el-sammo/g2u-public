(function() {
	'use strict';

	var app = angular.module('app');

	app.factory('restaurantsMgr', service);
	
	service.$inject = [
		'$http', '$q', '$rootScope'
	];
	
	function service(
		$http, $q, $rootScope
	) {
		var deferred;

		var service = {
			getRestaurants: function() {
				if(deferred) {
					return deferred.promise;
				}

				deferred = $q.defer();

				var areaId = $rootScope.areaId;

				// Retrieve restaurants
				$http.get('/restaurants/byAreaIdActive/' + areaId).then(function(res) {
					// if restaurants ajax succeeds...
					var allRestaurants = res.data;

					var promises = [];

					allRestaurants.map(function(restaurant) {
						var p = $http.get('/menus/byRestaurantId/' + restaurant.id);
						p.then(function(res) {
							// if menus ajax succeeds...
							restaurant.menus = res.data;
						});
						promises.push(p);
					});

					deferred.resolve($q.all(promises).then(function() {
						return allRestaurants;
					}));

				}).catch(function(err) {
					console.error('Error while retrieving restaurants:', err);
					deferred.reject(err);
				});

				return deferred.promise;
			},

			getRestaurantBySlug: function(slug) {
				return service.getRestaurants().then(function(restaurants) {
					return _.find(restaurants, function(restaurant) {
						return slug.match(restaurant.slug);
					});
				});
			},

			getMenuBySlug: function(slug) {
				return service.getRestaurants().then(function(restaurants) {
					// Build menu
					var menus = _.flatten(_.pluck(restaurants, 'menus'));
					return _.findWhere(menus, {slug: slug});
				});
			}
		};

		return service;
	}

}());
