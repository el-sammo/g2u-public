(function() {
	'use strict';

	var app = angular.module('app');

	app.controller('AccountEditController', controller);
	
	controller.$inject = [
		'$scope', '$http', '$routeParams', '$rootScope', 'navMgr', 'messenger', 
		'pod', 'customerSchema', 'customerMgmt'
	];

	function controller(
		$scope, $http, $routeParams, $rootScope, navMgr, messenger, 
		pod, customerSchema, customerMgmt
	) {
		navMgr.protect(function() { return $scope.form.$dirty; });
		pod.podize($scope);

		$scope.customerSchema = customerSchema;
		$scope.editMode = true;

		customerMgmt.getCustomer($routeParams.id).then(function(customer) {
			$scope.customer = customerSchema.populateDefaults(customer);
		});

		$scope.save = function save(customer, options) {
			options || (options = {});

			// TODO
			// clean phone; integers only

			customerMgmt.updateCustomer(customer).then(function() {
				messenger.show('Your account has been updated.', 'Success!');
				$scope.form.$setPristine();
			});
		};

		$scope.cancel = function cancel() {
			navMgr.cancel('/app/account/' +$routeParams.id);
		};
	}

}());
