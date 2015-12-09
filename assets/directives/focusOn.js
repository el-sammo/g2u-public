(function() {
	'use strict';

	var app = angular.module('app');

	///
	// Focus On
	///

	/**
	 * Focus On - Sets focus to element when value evaluates to true.
	 *
	 * Example:
	 *
	 *   <input ng-show="! myVal" focus-on="! myVal">
	 *
	 */
	app.directive('focusOn', focusOn);
	
	focusOn.$inject = ['$timeout'];
	
	function focusOn($timeout) {
		return {
			restrict: 'A',
			link: function($scope, element, attr) {
				$scope.$watch(attr.focusOn, function(_focusVal) {
					if(! _focusVal) return;
					$timeout(function() {
						$(element).focus();
					});
				});
			}
		}
	}

}());
