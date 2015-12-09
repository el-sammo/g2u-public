(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Order Management
	///

	app.factory('orderMgmt', service);
	
	service.$inject = [
		'$modal', '$rootScope', '$http'
	];
	
	function service($modal, $rootScope, $http) {
		var service = {
			checkout: function(order) {
				$modal.open({
					templateUrl: '/templates/checkout.html',
					backdrop: true,
					controller: 'CheckoutController',
					resolve: {
						args: function() {
							return {
								order: order
							}
						}
					}
				});
			},
			checkoutProhibited: function(order) {
				$modal.open({
					templateUrl: '/templates/checkoutProhibited.html',
					backdrop: true,
					controller: 'CheckoutController',
					resolve: {
						args: function() {
							return {
								order: order
							}
						}
					}
				});
			},
			delFeeExp: function(things, delFee) {
				$modal.open({
					templateUrl: '/templates/deliveryFeeExplained.html',
					backdrop: true,
					controller: 'ExplainerController',
					resolve: {
						args: function() {
							return {
								things: things,
								delFee: delFee
							}
						}
					}
				});
			},
			add: function(item) {
				$modal.open({
					templateUrl: '/templates/addItemOptions.html',
					backdrop: true,
					controller: 'OrderMgmtController',
					resolve: {
						args: function() {
							return {
								item: item
							}
						}
					}
				});
			},
			addBev: function(bev) {
				$modal.open({
					templateUrl: '/templates/addBevOptions.html',
					backdrop: true,
					controller: 'OrderMgmtController',
					resolve: {
						args: function() {
							return {
								bev: bev
							}
						}
					}
				});
			},
			remove: function(thing) {
				$modal.open({
					templateUrl: '/templates/removeItemOptions.html',
					backdrop: true,
					controller: 'OrderMgmtController',
					resolve: {
						args: function() {
							return {
								thing: thing
							}
						}
					}
				});
			},
			removeBev: function(bevThing) {
				$modal.open({
					templateUrl: '/templates/removeBevOptions.html',
					backdrop: true,
					controller: 'OrderMgmtController',
					resolve: {
						args: function() {
							return {
								bevThing: bevThing
							}
						}
					}
				});
			}
		};
		return service;
	}

}());
