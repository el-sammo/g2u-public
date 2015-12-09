(function() {
	'use strict';

	var app = angular.module('app');

	app.factory('areaMgmt', service);
	
	service.$inject = [
		'$rootScope'
	];

	function service($rootScope) {
		var service = {
			getArea: function() {
				/**
				 * TODO - Make areas work, and test thoroughly
				 *
					var winLocStr = location.hostname;
					var winLocPcs = winLocStr.split('.');

					if(winLocPcs[0] === 'grub2you' || winLocPcs[0] === 'www') {
						// not an area-specific url
					
						// TODO
						// get areaId
						$rootScope.areaId = '54b32e4c3756f5d15ad4ca49';
						// TODO
						// get areaName
						$rootScope.areaName = 'Casper';
						// TODO
						// get areaPhone
						$rootScope.areaPhone = '234-GRUB';

					} else {
						var areaName;
						if(clientConfig.environment == 'development') {
							areaName = 'casper';
						} else {
							areaName = winLocPcs[0];
						}
						var p = $http.get('/areas/byName/' + areaName);
							
						// if areas ajax fails...
						p.error(function(err) {
							console.log('fakeAuthFactory: areas ajax failed');
							console.error(err);
						});
									
						// if areas ajax succeeds...
						p.then(function(res) {
							$rootScope.areaId = res.data[0].id;
							$rootScope.areaName = res.data[0].name;
							$rootScope.areaPhone = res.data[0].phone;
						});

					}
				*/

				var area = {
					id: '54b32e4c3756f5d15ad4ca49',
					name: 'Casper',
					phone: '234-GRUB'
				};

				$rootScope.areaId = area.id;
				$rootScope.areaName = area.name;
				$rootScope.areaPhone = area.phone;

				return area;
			}
		};

		return service;
	}

}());
