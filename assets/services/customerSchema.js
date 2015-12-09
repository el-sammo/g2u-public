(function() {
	'use strict';

	var app = angular.module('app');

	app.factory('customerSchema', service);
	
	service.$inject = [ ];
	
	function service() {
		function nameTransform(customer) {
			if(! customer || ! customer.fName || customer.name.length < 1) {
				return 'customer-name';
			}
			return (customer.name
				.replace(/[^a-zA-Z ]/g, '')
				.replace(/ /g, '-')
				.toLowerCase()
			);
		}

		var service = {
			defaults: {
				customer: {
					areaId: '',
					fName: '',
					lName: '',
					addresses: {
						primary: {
							streetNumber: '',
							streetName: '',
							apt: '',
							city: '',
							state: '',
							zip: ''
						}
					},
					username: '',
					password: '',
					phone: '',
					email: ''
				}
			},

			links: {
				website: {
					placeholder: function(customer) {
						return 'www.' + nameTransform(customer) + '.com';
					},
					addon: 'http://'
				},
				facebook: {
					placeholder: nameTransform,
					addon: 'facebook.com/'
				},
				twitter: {
					placeholder: nameTransform,
					addon: '@'
				},
				instagram: {
					placeholder: nameTransform,
					addon: 'instagram.com/'
				},
				pinterest: {
					placeholder: nameTransform,
					addon: 'pinterest.com/'
				},
			},

			populateDefaults: function(customer) {
				$.map(service.defaults.customer, function(value, key) {
					if(customer[key]) return;
					if(typeof value === 'object') {
						customer[key] = angular.copy(value);
						return;
					}
					customer[key] = value;
				});
				return customer;
			}
		};

		return service;
	}

}());
