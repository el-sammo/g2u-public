(function() {
	'use strict';

	var app = angular.module('app');


	///
	// Responsive Layout Manager
	///

	app.constant('bigScreenWidth', 1179);


	app.factory('deviceMgr', service);
	
	service.$inject = [
		'$window', 'bigScreenWidth'
	];
	
	function service($window, bigScreenWidth) {
		var service = {
			getWindowWidth: function() {
				return $($window).width();
			},

			isBigScreen: function(width) {
				width || (width = service.getWindowWidth());
				return width >= bigScreenWidth;
			}
		};

		return service;
	}


	app.directive('smallScreen', smallScreen);
	
	smallScreen.$inject = [
		'$window', 'deviceMgr'
	];
	
	function smallScreen($window, deviceMgr) {
		return function ($scope, element, args) {
			$scope.$watch(deviceMgr.getWindowWidth, function(width) {
				if(deviceMgr.isBigScreen()) {
					return $(element).hide();
				}
				$(element).show();
			}, true);

			angular.element($window).bind('resize', function() {
				$scope.$apply();
			});
		}
	}


	app.directive('bigScreen', bigScreen);
	
	bigScreen.$inject = [
		'$window', 'bigScreenWidth'
	];
	
	function bigScreen($window, bigScreenWidth) {
		return function ($scope, element, args) {
			$scope.$watch(deviceMgr.getWindowWidth, function(width) {
				if(! deviceMgr.isBigScreen()) {
					return $(element).hide();
				}
				$(element).show();
			}, true);

			angular.element($window).bind('resize', function() {
				$scope.$apply();
			});
		}
	}


	app.directive('manageHeight', manageHeight);
	
	manageHeight.$inject = [
		'$window', 'bigScreenWidth'
	];
	
	function manageHeight($window, bigScreenWidth) {
		function getWindowHeight() {
			return $($window).height();
		}

		function getWindowWidth() {
			return $($window).width();
		}

		function resizeElement(el, newHt) {
			var adjHt = newHt - 266;
			$(el).height(adjHt);
		}

		function clearSize(el) {
			$(el).height('');
		}

		function doNotManage() {
			return getWindowWidth() < bigScreenWidth;
		}

		return function ($scope, element, args) {
			function manageSize(height) {
				height = (args.manageHeight === 'order' ? height - 52 : height);
				resizeElement(element, height);
			}

			$scope.$watch(getWindowHeight, function(height) {
				if(doNotManage()) return;
				
				manageSize(height);
			}, true);

			$scope.$watch(getWindowWidth, function(width) {
				if(doNotManage()) {
					return clearSize(element);
				}

				manageSize(getWindowHeight());
			}, true);

			angular.element($window).bind('resize', function() {
				$scope.$apply();
			});
		}
	}

}());
