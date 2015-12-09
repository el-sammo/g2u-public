(function() {
	'use strict';

	var app = angular.module('app');

	///
	// OrderController
	///

	app.controller('OrderController', controller);
	
	controller.$inject = [
		'navMgr', 'pod', '$scope', '$http', '$routeParams', '$modal', 'orderMgmt',
		'$rootScope', '$q', 'layoutMgmt', 'clientConfig', 'delFeeMgmt',
		'hoursMgr', 'customerMgmt'
	];

	function controller(
		navMgr, pod, $scope, $http, $routeParams, $modal, orderMgmt,
		$rootScope, $q, layoutMgmt, clientConfig, delFeeMgmt,
		hoursMgr, customerMgmt
	) {
		// TODO
		// put this in a config? or what?
		// orderStatus map
		// < 1 = not started
		// 1   = started (ordering)
		// 2   = payment initiated
		// 3   = payment ajax call failed
		// 4   = payment declined
		// 5   = payment accepted
		// 6   = order ordered (at restaurant)
		// 7   = order picked up
		// 8   = order en route
		// 9   = order delivered
		
		$scope.clientConfig = clientConfig;

		$scope.removeItem = orderMgmt.remove;
		$scope.removeBevItem = orderMgmt.removeBev;

		$scope.delFeeExp = orderMgmt.delFeeExp;

		$rootScope.$on('orderChanged', function(evt, args) {
			$scope.updateOrder();
		});

		///
		// Checkout Actions
		///

		$scope.checkout = function(order) {
			var isProhibited = true;

			var now = new Date().getHours();

			var delHoursPromise = hoursMgr.getDeliveryHours();
		
			delHoursPromise.then(function(delHours) {
				var now = new Date().getHours();
		
				delHours.forEach(function(hours) {
					if(hours.start > 11) {
						var todayStart = (parseInt(hours.start) - 12) + 'pm';
						var todayEnd = (parseInt(hours.end) - 12) + 'pm';
					} else {
						var todayStart = parseInt(hours.start) + 'am';
						var todayEnd = parseInt(hours.end) + 'am';
					}
				
					if(hours.end > 11) {
						var todayEnd = (parseInt(hours.end) - 12) + 'pm';
					} else {
						var todayEnd = parseInt(hours.end) + 'am';
					}
					
					var starting = (parseInt(hours.start) - 1);
					var ending = parseInt(hours.end);

					if(now >= starting && now < ending) {
						isProhibited = false;
					}

				});
				
				// clientConfig.showCheckout just overrides this logic in 
				// development environments
				if(clientConfig.showCheckout) {
					isProhibited = false;
				}

				if(isProhibited) {
					return orderMgmt.checkoutProhibited();
				}

				if(! (order && order.customerId)) {
					return layoutMgmt.logIn();
				}

				orderMgmt.checkout(order);
			
			});
		};

		$scope.updateOrder = function() {
			var sessionPromise = customerMgmt.getSession();
		
			sessionPromise.then(function(sessionData) {
				if(sessionData.order) {
					var order = sessionData.order;
					$scope.orderStatus = parseInt(order.orderStatus);
					$scope.order = order;
					$scope.things = order.things;
					$scope.bevThings = order.bevThings;
					$scope.updateTotals(order);
				}
			});
		};

		$scope.updateTotals = function(order) {
			var customer = {};
			if(order.customerId) {
				customerMgmt.getCustomer(order.customerId).then(function(customer) {
					customer = customer;

					var things;
					if(order.things) {
						things = order.things;
					} else {
						things = [];
					}
		
					var bevThings;
					if(order.bevThings) {
						bevThings = order.bevThings;
					} else {
						bevThings = [];
					}
		
					var subtotal = 0;
					var tax = 0;
					// TODO this should be configged on the area level
					var taxRate = .05;
					var multiplier = 100;
					var deliveryFee = 0;
					var discount = 0;
					var gratuity = 0;
					var total = 0;
		
					if(things.length > 0) {
						things.forEach(function(thing) {
							var lineTotal;
				
							if(thing.quantity && thing.quantity > 1) {
								lineTotal = parseFloat(thing.price) * thing.quantity;
							} else {
								lineTotal = parseFloat(thing.price);
							}
							subtotal = (Math.round((subtotal + lineTotal) * 100)/100);
						});
					}
		
					if(bevThings.length > 0) {
						bevThings.forEach(function(bevThing) {
							var lineTotal;
				
							if(bevThing.quantity && bevThing.quantity > 1) {
								lineTotal = parseFloat(bevThing.price) * bevThing.quantity;
							} else {
								lineTotal = parseFloat(bevThing.price);
							}
							subtotal = (Math.round((subtotal + lineTotal) * 100)/100);
						});
					}
		
					if(customer.taxExempt) {
						order.taxExempt = true;
					} else {
						tax = (Math.round((subtotal * taxRate) * 100) / 100);
					}
		
					if(order.discount) {
						discount = parseFloat(order.discount);
					}
		
					if(order.gratuity) {
						gratuity = parseFloat(order.gratuity);
					}
		
					var sessionPromise = customerMgmt.getSession();
		
					sessionPromise.then(function(sessionData) {
						if(sessionData.order && sessionData.order.things) {
							var deliveryFeeTiers = delFeeMgmt;
							deliveryFee = deliveryFeeTiers[0];
					
							if(sessionData.customerId) {
								var deliveryFeePromise = $scope.calculateDeliveryFee(sessionData.customerId, things);
					
								deliveryFeePromise.then(function(feeData) {
									var addRestsFee = 0;
		
									if(feeData.addRests > 0) {
										addRestsFee = feeData.addRests * deliveryFeeTiers[3];
									}
		
									if(feeData.driveTime <= 450) {
										deliveryFee = deliveryFeeTiers[0];
									} else if(feeData.driveTime <= 720) {
										deliveryFee = deliveryFeeTiers[1];
									} else {
										deliveryFee = deliveryFeeTiers[2];
									}
		
									deliveryFee = deliveryFee + addRestsFee;
									
									total = (Math.round((subtotal + tax + deliveryFee - discount + gratuity) * 100)/100);
								
									$scope.subtotal = subtotal.toFixed(2);
									$scope.tax = tax.toFixed(2);
									$scope.deliveryFee = deliveryFee.toFixed(2);
									$scope.discount = discount.toFixed(2);
									$scope.gratuity = gratuity.toFixed(2);
									$scope.total = total.toFixed(2);
								
									order.subtotal = subtotal;
									order.tax = tax;
									order.deliveryFee = $scope.deliveryFee;
									order.discount = discount;
									order.total = total;
								
									var p = $http.put('/orders/' + order.id, order);
										
									// if orders ajax fails...
									p.error(function(err) {
										console.log('OrderController: updateOrder ajax failed');
										console.error(err);
									});
								});
							} else {
								total = (Math.round((subtotal + tax + deliveryFee - discount + gratuity) * 100)/100);
							
								$scope.subtotal = subtotal.toFixed(2);
								$scope.tax = tax.toFixed(2);
								$scope.deliveryFee = deliveryFee.toFixed(2);
								$scope.discount = discount.toFixed(2);
								$scope.gratuity = gratuity.toFixed(2);
								$scope.total = total.toFixed(2);
							
								order.subtotal = subtotal;
								order.tax = tax;
								order.deliveryFee = $scope.deliveryFee;
								order.discount = discount;
								order.total = total;
							
								var p = $http.put('/orders/' + order.id, order);
									
								// if orders ajax fails...
								p.error(function(err) {
									console.log('OrderController: updateOrder ajax failed');
									console.error(err);
								});
							}
						}
					});
				}).catch(function(err) {
					console.log('customer ajax failed');
				});
			} else {
				var things;
				if(order.things) {
					things = order.things;
				} else {
					things = [];
				}
	
				var bevThings;
				if(order.bevThings) {
					bevThings = order.bevThings;
				} else {
					bevThings = [];
				}
	
				var subtotal = 0;
				var tax = 0;
				// TODO this should be configged on the area level
				var taxRate = .05;
				var multiplier = 100;
				var deliveryFee = 0;
				var discount = 0;
				var gratuity = 0;
				var total = 0;
	
				if(things.length > 0) {
					things.forEach(function(thing) {
						var lineTotal;
			
						if(thing.quantity && thing.quantity > 1) {
							lineTotal = parseFloat(thing.price) * thing.quantity;
						} else {
							lineTotal = parseFloat(thing.price);
						}
						subtotal = (Math.round((subtotal + lineTotal) * 100)/100);
					});
				}
	
				if(bevThings.length > 0) {
					bevThings.forEach(function(bevThing) {
						var lineTotal;
			
						if(bevThing.quantity && bevThing.quantity > 1) {
							lineTotal = parseFloat(bevThing.price) * bevThing.quantity;
						} else {
							lineTotal = parseFloat(bevThing.price);
						}
						subtotal = (Math.round((subtotal + lineTotal) * 100)/100);
					});
				}
	
				if(customer.taxExempt) {
				} else {
					tax = (Math.round((subtotal * taxRate) * 100) / 100);
				}
	
				if(order.discount) {
					discount = parseFloat(order.discount);
				}
	
				if(order.gratuity) {
					gratuity = parseFloat(order.gratuity);
				}
	
				var sessionPromise = customerMgmt.getSession();
	
				sessionPromise.then(function(sessionData) {
					if(sessionData.order && sessionData.order.things) {
						var deliveryFeeTiers = delFeeMgmt;
						deliveryFee = deliveryFeeTiers[0];
				
						if(sessionData.customerId) {
							var deliveryFeePromise = $scope.calculateDeliveryFee(sessionData.customerId, things);
				
							deliveryFeePromise.then(function(feeData) {
								var addRestsFee = 0;
	
								if(feeData.addRests > 0) {
									addRestsFee = feeData.addRests * deliveryFeeTiers[3];
								}
	
								if(feeData.driveTime <= 450) {
									deliveryFee = deliveryFeeTiers[0];
								} else if(feeData.driveTime <= 720) {
									deliveryFee = deliveryFeeTiers[1];
								} else {
									deliveryFee = deliveryFeeTiers[2];
								}
	
								deliveryFee = deliveryFee + addRestsFee;
								
								total = (Math.round((subtotal + tax + deliveryFee - discount + gratuity) * 100)/100);
							
								$scope.subtotal = subtotal.toFixed(2);
								$scope.tax = tax.toFixed(2);
								$scope.deliveryFee = deliveryFee.toFixed(2);
								$scope.discount = discount.toFixed(2);
								$scope.gratuity = gratuity.toFixed(2);
								$scope.total = total.toFixed(2);
							
								order.subtotal = subtotal;
								order.tax = tax;
								order.deliveryFee = $scope.deliveryFee;
								order.discount = discount;
								order.total = total;
							
								var p = $http.put('/orders/' + order.id, order);
									
								// if orders ajax fails...
								p.error(function(err) {
									console.log('OrderController: updateOrder ajax failed');
									console.error(err);
								});
							});
						} else {
							total = (Math.round((subtotal + tax + deliveryFee - discount + gratuity) * 100)/100);
						
							$scope.subtotal = subtotal.toFixed(2);
							$scope.tax = tax.toFixed(2);
							$scope.deliveryFee = deliveryFee.toFixed(2);
							$scope.discount = discount.toFixed(2);
							$scope.gratuity = gratuity.toFixed(2);
							$scope.total = total.toFixed(2);
						
							order.subtotal = subtotal;
							order.tax = tax;
							order.deliveryFee = $scope.deliveryFee;
							order.discount = discount;
							order.total = total;
						
							var p = $http.put('/orders/' + order.id, order);
								
							// if orders ajax fails...
							p.error(function(err) {
								console.log('OrderController: updateOrder ajax failed');
								console.error(err);
							});
						}
					}
				});
			}
		};

		$scope.calculateDeliveryFee = function(customerId, things) {
			var deliveryFeeTiers = delFeeMgmt;
	
			return customerMgmt.getCustomer(customerId).then(function(customer) {
				var driveTimePromise;
	
				var promises = [];
				var rests = [];
				things.forEach(function(thing) {
					if(rests.indexOf(thing.restaurantId) < 0) {
						rests.push(thing.restaurantId);
					}
					promises.push(driveTimePromise = $scope.getDriveTime(thing, customer));
				});

				var addRests = 0;
				if(rests.length > 1) {
					addRests = rests.length - 1;
				}

				return $q.all(promises).then(function(durations) {
					var mostDriveTime = 0;
					durations.forEach(function(duration) {
						if(duration > mostDriveTime) {
							mostDriveTime = duration;
						}
					});

					return {driveTime: mostDriveTime, addRests: addRests}
				});
			}).catch(function(err) {
				console.log('OrderController: calculateDeliveryFee-customer ajax failed');
				console.error(err);
				resolve(deliveryFeeTiers[0]);
			});
		};

		$scope.getDriveTime = function(thing, customer) {
			return $q(function(resolve, reject) {
				$http.get('/restaurants/' + thing.restaurantId).then(function(res) {
					var addresses = res.data.addresses;
					var delivery = customer.addresses.primary;
					var addsLength = addresses.length;
					var scope = {};
					scope.durArray = []

					addresses.forEach(function(address) {
						$http.get('/distances/calc', {
							params: {
								origins: [
									'\''+address.streetNumber+' '+address.streetName+' '+address.city+' '+address.state+' '+address.zip+'\''
								].join('|'),
								destinations: [
									'\''+delivery.streetNumber+' '+delivery.streetName+' '+delivery.city+' '+delivery.state+' '+delivery.zip+'\''
								].join('+')
							}
						}).then(function(res) {
							var data = res.data;
							var nearest = 0;
							data.rows.forEach(function(row) {
								row.elements.forEach(function(element) {
									if(element.status == 'NOT_FOUND') {
										resolve(parseInt(5));
									} else {
										var duration = element.duration.value;
										scope.durArray.push(duration);
									}
								});
							});
							if(scope.durArray.length == addsLength) {
								scope.durArray.sort();
								resolve(scope.durArray[0]);
							}
						});
					});
					return;
				}).catch(function(err) {
					console.error(err);
					resolve(150);
				});
			});
		};
		$scope.updateOrder();
	}

}());
