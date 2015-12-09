(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Search Engine Optimization
	///

	app.service('seo', service);
	
	service.$inject = [
	];
	
	function service() {
		var pages = {
			default: {
				title: 'Restaurant Delivery',
				description: '',
				// Prepend global keywords for all pages
				keywords: ['grub2you']
			},
			careers: {
				title: 'Careers',
				description: '',
				keywords: []
			}
		};

		var properties;
		var service = {
			title: function() {
				return properties.title;
			},
			description: function() {
				return properties.description;
			},
			keywords: function() {
				// Final global keywords for all pages
				var keywords = angular.copy(properties.keywords);
				keywords = keywords.concat([
					'grub to you', 'grubtoyou', 'grub 2 you'
				]);
				return keywords.join(', ');
			},
			reset: function() {
				service.setPage('default');
			},
			setTitle: function(title) {
				properties.title = 'Grub2You - ' + title;
			},
			setDescription: function(description) {
				properties.description = description;
			},
			appendKeywords: function(keywords) {
				if(! _.isArray(keywords)) {
					keywords = [keywords];
				}
				properties.keywords = properties.keywords.concat(keywords);
			},
			setPage: function(page) {
				properties = angular.copy(pages[page] || pages.default);
				properties.title = 'Grub2You - ' + properties.title;
			}
		};
		service.reset();
		return service;
	}


	app.controller('SeoController', controller);
	
	controller.$inject = [
		'$scope', 'seo'
	];

	function controller($scope, seo) {
		$scope.seo = seo;
	}

}());
