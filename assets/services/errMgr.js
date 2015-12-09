(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Error management
	///

	app.factory('errMgr', service);
	
	service.$inject = [
		'$modal', '$rootScope'
	];
	
	function service($modal, $rootScope) {
		var service = {
			show: function(message, title) {
				$modal.open({
					templateUrl: '/templates/error.html',
					backdrop: true,
					controller: 'ErrController',
					resolve: {
						options: function() {
							return {
								message: message || 'An unknown error occurred.',
								title: title || 'Whoops! Something went wrong...'
							};
						}
					}
				});
			}
		};

		$rootScope.$on('httpError', function(evt, args) {
			service.show(args.error);
		});

		return service;
	}


	app.controller('ErrController', controller);
	
	controller.$inject = [
		'$scope', 'options'
	];

	function controller($scope, options) {
		$scope.options = options;
	}

}());
