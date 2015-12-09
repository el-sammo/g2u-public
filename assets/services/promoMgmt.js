(function() {
	'use strict';

	var app = angular.module('app');

	app.factory('promoMgmt', service);
	
	service.$inject = [
		'$rootScope', '$http'
	];
	
	function service($rootScope, $http) {
		var service = {
			getPromo: function(currentDelFee, promoCode, customerId) {
				return $http.post('/promos/getPromo', {
					currentDelFee: currentDelFee, promoCode: promoCode, customerId: customerId
				});
			}
		}

		return service;
	}

}());
