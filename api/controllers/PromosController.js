/**
 * PromosController
 *
 * @description :: Server-side logic for managing promos
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var ordersController = require('./OrdersController');

module.exports = {
  datatables: function(req, res) {
    var options = req.query;

    Promos.datatables(options).sort({name: 'asc'}).then(function(results) {
      res.send(JSON.stringify(results));
    }).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
    });
  },

	byAreaId: function(req, res) {
		Promos.findByAreaId(req.params.id).sort({name: 'asc'}).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	},
	
	byName: function(req, res) {
		Promos.findByName(req.params.id).sort({name: 'asc'}).then(function(results) {
			res.send(JSON.stringify(results));
		}).catch(function(err) {
      res.json({error: 'Server error'}, 500);
      console.error(err);
      throw err;
		});
	},
	
	getPromo: function(req, res) {
		if(!(req.body && req.body.currentDelFee && req.body.promoCode && req.body.customerId)) {
			return res.json({success: false, reason: 'invalid'});
		}

		var scope = {};
		scope.promoCode = req.body.promoCode;
		scope.customerId = req.body.customerId;

		return Orders.find(
			{promo: scope.promoCode, customerId: scope.customerId}
		).then(function(orders) {
			scope.custRedemptions = orders.length;
			return PromosService.byName(scope.promoCode).then(function(thisPromo) {
				scope.promoData = thisPromo;

				if(scope.custRedemptions >= parseInt(scope.promoData.uses)) {
					return res.json({success: false, reason: 'redeemed'});
				}

				var todayYear = new Date().getFullYear();
				var todayMonth = new Date().getMonth() + 1;
				var todayDate = new Date().getDate();

				if(todayMonth < 10) {
					todayMonth = '0'+todayMonth;
				}

				if(todayDate < 10) {
					todayDate = '0'+todayDate;
				}

				var today = todayYear+''+todayMonth+''+todayDate;

				var promoExpPcs = scope.promoData.expires.split('-');
				var promoExpMonth = promoExpPcs[0];
				var promoExpDate = promoExpPcs[1];
				var promoExpYear = promoExpPcs[2];

				if(parseInt(promoExpMonth) < 10) {
					promoExpMonth = '0'+parseInt(promoExpMonth);
				}

				if(parseInt(promoExpDate) < 10) {
					promoExpDate = '0'+parseInt(promoExpDate);
				}

				var promoExp = promoExpYear+''+promoExpMonth+''+promoExpDate;

				var thisPromo = scope.promoData;
				var changeAmount;

				if(parseInt(today) > parseInt(promoExp)) {
					return res.json({success: false, reason: 'expired'});
				}

				if(thisPromo.effect == 'reduce') {
					changeAmount = parseFloat(req.body.currentDelFee) - parseFloat(thisPromo.amount);
				}
			
				if(thisPromo.effect == 'replace') {
					changeAmount = thisPromo.amount;
				}
		
				res.json({success: true, effect: thisPromo.effect, amount: changeAmount});
			}).catch(function(err) {
				res.json({success: false, reason: 'invalid'});
			});
		});
	}
};

