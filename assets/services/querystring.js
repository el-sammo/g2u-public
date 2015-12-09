(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Querystring builder
	///
		
	app.factory('querystring', service);
	
	service.$inject = [
	];
	
	function service() {
		var service = {
			stringify: function(query, noEncode) {
				var items = [];
				angular.forEach(query, function(value, key) {
					if(noEncode) {
						items.push(key + '=' + value);
					} else {
						items.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
					}
				});
				return items.join('&');
			}
		};
		return service;
	}

}());
