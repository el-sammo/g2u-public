(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Account Management
	///

	app.factory('customerMgmt', service);
	
	service.$inject = [
		'$http', '$q', '$sce', 'configMgr', 'querystring'
	];
	
	function service(
		$http, $q, $sce, configMgr, querystring
	) {
		var customer;
		var getCustomerPromise;

		var service = {
			getCustomer: function(customerId) {
				if(getCustomerPromise) {
					return getCustomerPromise;
				}

				var url = '/customers/' + customerId;
				getCustomerPromise = $http.get(url).then(function(res) {
					mergeIntoCustomer(res.data);
					return customer;
				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});

				return getCustomerPromise;
			},

			createCustomer: function(customerData) {
				var address = customerData.addresses.primary;
	
				var addressString = address.streetNumber+' '+address.streetName+' '+address.city+' '+address.state+' '+address.zip;
				
				return $http.get('/customers/getCoords/'+addressString).then(function(response) {
					var geo = {};
					geo.latitude = response.data.lat;
					geo.longitude = response.data.long;
					geo.googlePlaceId = response.data.gPID;

					customerData.geo = geo;

					var url = '/customers/create';
					return $http.post(url, customerData).success(
						function(data, status, headers, config) {
							if(status >= 400) {
								return $q.reject(data);
							}
							mergeIntoCustomer(data, true);
							return customer;
						}
					).catch(function(err) {
						console.log('POST ' + url + ': ajax failed');
						console.error(err);
						return $q.reject(err);
					});
				});
			},

			updateCustomer: function(customerData) {
				var url = '/customers/' + customerData.id;
				return $http.put(url, customerData).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoCustomer(data, true);
						return customer;
					}
				).catch(function(err) {
					console.log('PUT ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			logout: function() {
				var url = '/customers/logout';
				return $http.get(url).success(
					function(data, status, headers, config) {
						if(status >= 400) {
							return $q.reject(data);
						}
						mergeIntoCustomer({}, true);
					}
				).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					return $q.reject(err);
				});
			},

			getSession: function() {
				var url = '/customers/session';
				return $http.get(url).then(function(sessionRes) {
					if(! (sessionRes && sessionRes.data)) {
						return $q.reject(sessionRes);
					}
					return sessionRes.data;

				}).catch(function(err) {
					console.log('GET ' + url + ': ajax failed');
					console.error(err);
					$q.reject(err);
				});
			}

		};

		function mergeIntoCustomer(data, replace) {
			if(! customer) {
				customer = data;
				return;
			}

			// Delete all original keys
			if(replace) {
				angular.forEach(customer, function(val, key) {
					delete customer[key];
				});
			}

			angular.forEach(data, function(val, key) {
				customer[key] = val;
			});
		};

		return service;
	}

}());
