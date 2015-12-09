(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Configuration managements
	///
		
	app.factory('configMgr', service);
	
	service.$inject = [ ];
	
	function service() {
		var service = {
			config: {
				vendors: {
					googleMaps: {
						key: 'AIzaSyCmRFaH2ROz5TueD8XapBCTAdBppUir_Bs'
					}
				}
			},
		};
		return service;
	}

}());
