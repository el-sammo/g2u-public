(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Controllers: Account
	///

	app.controller('AccountController', controller);
	
	controller.$inject = [
		'$scope', '$http', 'messenger', '$rootScope',
		'$window', 'payMethodMgmt', 'layoutMgmt', 'customerMgmt',
		'accountMgmt'
	];

	function controller(
		$scope, $http, messenger, $rootScope,
		$window, payMethodMgmt, layoutMgmt, customerMgmt,
		accountMgmt
	) {

		$scope.addPM = payMethodMgmt.modals.add;
		$scope.removePM = payMethodMgmt.modals.remove;
		$scope.changeAddress = accountMgmt.modals.changeAddress;

		$scope.logOut = layoutMgmt.logOut;

		var sessionPromise = customerMgmt.getSession();

		sessionPromise.then(function(sessionData) {
			if(!sessionData.customerId) {
				$window.location.href = '/';
				return;
			}

			var customerId = sessionData.customerId;

			customerMgmt.getCustomer(customerId).then(function(customer) {
				$scope.customer = customer;
				var taxExempt = '';
				if(customer.taxExempt) {
					var taxExempt = 'Tax Exempt';
				}
				$scope.taxExempt = taxExempt;
			});
		
			var r = $http.get('/orders/byCustomerId/' + customerId);
		
			r.error(function(err) {
				console.log('AccountController: orders ajax failed');
				console.error(err);
			});
		
			r.then(function(res) {
				var completedHistory = [];
				res.data.forEach(function(order) {
					if(order.orderStatus > 4) {

						var d = new Date(order.paymentAcceptedAt);

						var orderYear = d.getFullYear();
						var orderMonth = d.getMonth() + 1;
						var orderDate = d.getDate();

						if(orderMonth < 10) {
							orderMonth = '0'+orderMonth;
						}

						if(orderDate < 10) {
							orderDate = '0'+orderDate;
						}

						var completedDate = orderYear+'-'+orderMonth+'-'+orderDate;

						order.orderDate = completedDate;
						order.total = parseFloat(order.total).toFixed(2);
						completedHistory.push(order);
					}
				});
		
				$scope.orders = completedHistory;
			});
		});

		$rootScope.$on('customerChanged', function(evt, customer) {
			$scope.customer = customer;
		});
	}

}());
