/**
 * DistancesController
 *
 * @description :: Server-side logic for managing Distances
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var request = require('request-bluebird');
var _ = require('lodash');
var redisServer = require('then-redis');
var redis = redisServer.createClient();
var querystring = require('querystring');

// TODO Move to config file
var googleApiKey = 'AIzaSyCmRFaH2ROz5TueD8XapBCTAdBppUir_Bs';
var cacheTtl = 86400 * 7;

module.exports = {
	calc: function(req, res) {
		var redisKey = querystring.stringify(req.query);

		redis.get(redisKey).then(function(value) {
			if(value) {
				try {
					value = JSON.parse(value);
					return value;
				} catch(e) {
					sails.log.error(e, value);
				}
			}

			return request.getAsync({
				uri: 'https://maps.googleapis.com/maps/api/distancematrix/json?',
				qs: _.extend(req.query, {key: googleApiKey}),
				headers: {
					Referer: 'https://grub2you.com'
				},
				json: true
			}).then(function(apiRes) {
				var data = apiRes.pop();

				redis.set(redisKey, JSON.stringify(data));
				redis.expire(redisKey, cacheTtl);

				return data;
			});
		}).then(function(data) {
			res.json(data);
		}).catch(function(err) {
			sails.log.error(err);
			res.json(500, err);
		});
	}
};

