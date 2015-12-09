(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Layout Management
	///

	app.controller('LayoutMgmtController', controller);
	
	controller.$inject = [
		'$scope', '$modalInstance',	'$http',
		'$rootScope', '$window', 'layoutMgmt',
		'messenger', 'deviceMgr', 'customerMgmt'
	];

	function controller(
		$scope, $modalInstance,	$http,
		$rootScope, $window, layoutMgmt,
		messenger, deviceMgr, customerMgmt
	) {

		var p = $http.get('/areas/');

		$scope.badCreds = false;
							
		// if areas ajax fails...
		p.error(function(err) {
			console.log('layoutMgmt: areas ajax failed');
			console.error(err);
		});
									
		// if areas ajax succeeds...
		p.then(function(res) {
			$scope.areas = res.data;
		});

		$scope.areaName = $rootScope.areaName;
		$scope.accessAccount = $rootScope.accessAccount;

		$scope.credentials = {};

		$scope.required = function(field) {
			if(! $scope.submitted || field) return;
			return 'error';
		};

		$scope.noAccount = function() {
			$modalInstance.dismiss('cancel');
			layoutMgmt.signUp($scope.areas);
		};

		$scope.submit = function(credentials) {
			$http.post(
				'/login', credentials
			).success(function(data, status, headers, config) {
				// if login ajax succeeds...
				if(status >= 400) {
					$rootScope.$broadcast('customerLoggedIn', data.customerId);
					$modalInstance.dismiss('done');
				} else if(status == 200) {
					$rootScope.$broadcast('customerLoggedIn', data.customerId);
					$modalInstance.dismiss('done');
				} else {
					$rootScope.$broadcast('customerLoggedIn', data.customerId);
					$modalInstance.dismiss('done');
				}
			}).error(function(err) {
				console.log('we were NOT successful here - 1');
				// if login ajax fails...
				$scope.badCreds = true;
			});
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		}

		$scope.logOut = function() {
			customerMgmt.logout().then(function() {
				$modalInstance.dismiss('done');
				$window.location.href = '/';
			}).catch(function(err) {
				$modalInstance.dismiss('cancel');
				$window.location.href = '/';
			});
		}

		$scope.sendFeedback = function() {
			var feedback = {};
			feedback.areaName = $scope.areaName;
			feedback.email = $scope.email;
			feedback.feedback = $scope.feedback;
			feedback.name = $scope.name;

			$http.post('/feedback/create', feedback).then(function(res) {
				$modalInstance.dismiss('done');
				if(deviceMgr.isBigScreen()) {
					messenger.show('Your feedback has been received.', 'Success!');
				}
				$http.post('/mail/sendFeedbackToManagement/'+res.data.id);
			});
		}

	}

}());
