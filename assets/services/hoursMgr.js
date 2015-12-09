(function() {
	'use strict';

	var app = angular.module('app');

	app.factory('hoursMgr', service);
	
	service.$inject = [
		'$rootScope', '$http', '$q', 'clientConfig', 'areaMgmt'
	];
	
	function service($rootScope, $http, $q, clientConfig, areaMgmt) {
		var service = {
			getDeliveryHours: function() {
				var area = areaMgmt.getArea();
				var areaName = area.name;

				return $http.get('/areas/byName/' + areaName).then(function(res) {
					return getHours(res.data[0]);
				}).catch(function(err) {
					console.log('hoursMgr: areas ajax failed');
					console.error(err);
					$q.reject(err);
				});
			},

			getAllHours: function() {
				var area = areaMgmt.getArea();
				var areaName = area.name;

				return $http.get('/areas/byName/' + areaName).then(function(res) {
					return res.data[0].hours;
				}).catch(function(err) {
					console.log('hoursMgr: areas ajax failed');
					console.error(err);
					$q.reject(err);
				});
			}
		};

		var getHours = function(area) {
			var today = new Date().getDay();

			return area.hours[today];
		};

		return service;
	}

}());
