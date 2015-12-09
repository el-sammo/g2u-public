
var Promise = require('bluebird');

module.exports = {
	byName: function(promo) {
		return Promos.findByName(promo).sort({name: 'asc'}).then(function(res) {
			if(res.length < 1) {
				var err = new Error('invalid');
				return Promise.reject(err);
			}
			return res[0];
		});
	},

	getPromo: function(currentDelFee, promoCode, customerId) {
		if(!(currentDelFee && promoCode && customerId)) {
			return {success: false, reason: 'invalid'};
		}

		var scope = {};
		scope.promoCode = promoCode;
		scope.customerId = customerId;

		return Orders.find(
			{promo: scope.promoCode, customerId: scope.customerId}
		).then(function(orders) {
			scope.custRedemptions = orders.length;
			return PromosService.byName(scope.promoCode).then(function(thisPromo) {
				scope.promoData = thisPromo;

				if(scope.custRedemptions >= parseInt(scope.promoData.uses)) {
					return {success: false, reason: 'redeemed'};
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
					return {success: false, reason: 'expired'};
				}

				if(thisPromo.effect == 'reduce') {
					changeAmount = parseFloat(currentDelFee) - parseFloat(thisPromo.amount);
				}
			
				if(thisPromo.effect == 'replace') {
					changeAmount = thisPromo.amount;
				}
		
				return {success: true, effect: thisPromo.effect, amount: changeAmount};
			}).catch(function(err) {
				return {success: false, reason: 'invalid'};
			});
		});

	}
}
