(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Routes
	///

	app.config(config);
	
	config.$inject = [
		'$routeProvider', '$locationProvider'
	];
	
	function config($routeProvider, $locationProvider) {
		///
		// Tester Page
		///

		$routeProvider.when('/tester', {
			controller: 'TesterController',
			templateUrl: '/templates/tester.html'
		});


		///
		// Splash Page
		///

		$routeProvider.when('/', {
			controller: 'RestaurantsController',
			templateUrl: '/templates/restaurants.html'
			//controller: 'SplashController',
			//templateUrl: '/templates/index.html'
		});


		///
		// About Page
		///

		$routeProvider.when('/about', {
			controller: 'AboutController',
			templateUrl: '/templates/about.html'
		});


		///
		// Account
		///

		$routeProvider.when('/account', {
			controller: 'AccountController',
			templateUrl: '/templates/account.html'
		});

		$routeProvider.when('/account/edit/:id', {
			controller: 'AccountEditController',
			templateUrl: '/templates/accountForm.html'
		});


		///
		// Careers Page
		///

		$routeProvider.when('/careers', {
			controller: 'CareersController',
			templateUrl: '/templates/careers.html'
		});


		///
		// Cart
		///

		$routeProvider.when('/cart', {
			controller: 'OrderController',
			templateUrl: '/templates/orderPanelSmall.html'
		});


		///
		// Contact Page
		///

		$routeProvider.when('/contact', {
			controller: 'ContactController',
			templateUrl: '/templates/contact.html'
		});


		///
		// Privacy Page
		///

		$routeProvider.when('/privacy', {
			controller: 'PrivacyController',
			templateUrl: '/templates/privacy.html'
		});


		///
		// Order
		///

		$routeProvider.when('/order/:id', {
			controller: 'OrderDetailsController',
			templateUrl: '/templates/orderDetails.html'
		});


		///
		// Order (small)
		///

		$routeProvider.when('/orderSmall/:id', {
			controller: 'OrderDetailsController',
			templateUrl: '/templates/orderDetailsSmall.html'
		});


		///
		// Restaurants
		///

		$routeProvider.when('/restaurants/:id', {
			controller: 'RestaurantsController',
			templateUrl: '/templates/restaurants.html'
		});


		$routeProvider.when('/restaurants/', {
			controller: 'RestaurantsController',
			templateUrl: '/templates/restaurantsList.html'
		});


		///
		// Terms Page
		///

		$routeProvider.when('/terms', {
			controller: 'TermsController',
			templateUrl: '/templates/terms.html'
		});


		///
		// Other
		///

		$routeProvider.otherwise({
			redirectTo: '/'
		});


		///
		// HTML5 Routing (no hash)
		///
		
		$locationProvider.html5Mode(true);
	}

}());
