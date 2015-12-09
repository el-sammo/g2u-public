(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Account Management
	///

	app.factory('accountMgmt', accountMgmt);

	accountMgmt.$inject = [
		'$rootScope', '$q', '$http', '$modal'
	];
	
	function accountMgmt(
		$rootScope, $q, $http, $modal
	) {
		var service = {
			modals: {
				changeAddress: function(customerId) {
					$modal.open({
						templateUrl: '/templates/changeAddress.html',
						backdrop: true,
						controller: 'AccountModalController',
						resolve: {
							args: function() {
								return {
									customerId: customerId
								}
							}
						}
					});
				},
			}
		};

		return service;
	}

}());
