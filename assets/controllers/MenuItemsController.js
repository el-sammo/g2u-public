(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Menu Items
	///

	app.controller('MenuItemsController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$q', 'orderMgmt', 'slugMgr',
		'restaurantsMgr', 'seo'
	];

	function controller(
		$scope, $http, $routeParams, $q, orderMgmt, slugMgr,
		restaurantsMgr, seo
	) {
		$scope.addItem = orderMgmt.add;

		// Retrieve and display menu data (including items)
		function showMenu(id) {
			$http.get('/menus/' + id).then(function(res) {
				// if menu ajax succeeds...
				$scope.menuId = res.data.id;
				$scope.menuName = res.data.name;
				getItems($scope.menuId);

			}).catch(function(err) {
				// if menu ajax fails...
				console.log('RestaurantsController: showMenu ajax failed');
				console.error(err);
			});

		}

		$scope.timeFormat = function(secs) {
			var ampm = 'am';
			var hours = Math.floor(secs / 3600);
			if(hours > 12) {
				hours = hours - 12;
				ampm = 'pm';
			}
			var minutes = secs % 3600;
			if(minutes < 1) {
				minutes = '00';
			}
			return hours+':'+minutes+' '+ampm;
		};

		// Retrieve items by menu id (including options)
		function getItems(menuId) {
			$http.get('/items/activeByMenuId/' + menuId).then(function(res) {
				// if items ajax succeeds...
				var allItems = res.data;
				var keywords = [];

				allItems.map(function(item) {
					$http.get('/options/byItemId/' + item.id).then(function(res) {
						// if options ajax succeeds...
						item.options = res.data;

					}).catch(function(err) {
						// if options ajax fails...
						console.log('RestaurantsController: getItems-options ajax failed');
						console.error(err);
					});

					keywords.push(item.name);
				});

				// Add keywords for search engine optimization
				seo.appendKeywords(keywords);

				$scope.items = allItems;
			}).catch(function(err) {
				// if items ajax fails...
				console.log('RestaurantsController: getItems ajax failed');
				console.error(err);
			});

		};

		// Get slug
		var slugPromise;
		if($routeParams.id) {
			slugPromise = $q.when($routeParams.id);
		} else {
			slugPromise = slugMgr.randomSlug();
		}

		slugPromise.then(function(slug) {
			return restaurantsMgr.getMenuBySlug(slug);

		}).then(function(menu) {
			$scope.displayMenu = menu;
			showMenu(menu.id);
		});
	}

}());
