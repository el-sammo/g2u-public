/**
 * MailController
 *
 * @description :: Server-side logic for managing Mails
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var nodemailer = require('nodemailer');
var directTransport = require('nodemailer-direct-transport');
var Promise = require('bluebird');

var env = sails.config.environment;

module.exports = {
	sendNotifyToOperator: function(req, res) {
		if(env && env === 'production') {
			var customerId = req.params.id;
			var email = '3072778940@vtext.com, 3072514153@vtext.com, 3072594177@vtext.com, 3072583100@vtext.com';
			sendMail(email, 'Order Placed!', 'placed', customerId);
		}
	},

	sendFailToOperator: function(req, res) {
		if(env && env === 'production') {
			var email = 'sam.barrett@gmail.com, rebecca.l.barrett@gmail.com, rickrsgood@yahoo.com, sam.adamson@grub2you.com';
			var orderId = 'order_id_not_passed';
			if(req.params.id) {
				orderId = req.params.id;
			}
			sendMail(email, 'Payment Failed!', 'failed', orderId);
		}
	},

	sendUpdateToCustomer: function(req, res) {
		if(env && env === 'production') {
			var customerId = req.params.id;
	
			promise = Customers.find(customerId);
	
			promise.then(function(customer) {
				var customer = customer[0];
				var email = customer.phone + '@vtext.com';
				sendMail(email, 'On the Way!', 'update', customer);
			});
		}
	},

	sendConfirmationToCustomer: function(req, res) {
		if(env && env === 'production') {
			var customerId = req.params.id;
	
			promise = Customers.find(customerId);
	
			promise.then(function(customer) {
				var customer = customer[0];
				sendMail(customer.email, 'Thanks for Joining Grub2You!', 'signup', customer);
			});
		}
	},

	sendFeedbackToManagement: function(req, res) {
		if(env && env === 'production') {
			var feedbackId = req.params.id;
			var email = 'sam.barrett@gmail.com, rebecca.l.barrett@gmail.com, rickrsgood@yahoo.com, sam.adamson@grub2you.com';
			sendMail(email, 'Feedback Received!', 'feedback', feedbackId);
		}
	},

	sendOrderToCustomer: function(req, res) {
		if(env && env === 'production') {
			var customerId = req.params.id;
	
			promise = Customers.find(customerId);
	
			promise.then(function(customer) {
				var customer = customer[0];
				sendMail(customer.email, 'Thanks for Ordering!', 'order', customer);
			});
		}
	},

	sendToApplicant: function(req, res) {
		if(env && env === 'production') {
			var applicantId = req.params.id;
	
			promise = Applicants.find(applicantId);
	
			promise.then(function(applicant) {
				var applicant = applicant[0];
				sendMail(applicant.email, 'Thanks for Applying!', 'apply', applicant);
			});
		}
	}
};

function sendMail(email, subject, template, data) {
	var p = Promise.defer();

	var transporter = nodemailer.createTransport(directTransport());

	var mailOptions = {
			from: 'Grub2You <info@grub2you.com>',
			to: email,
			subject: subject,
			text: '',
			html: ''
		};

	if(template === 'apply') {
		mailOptions = {
			from: 'Grub2You <info@grub2you.com>',
			to: email,
			subject: subject,
			text: 'Thanks for applying for the role of '+data.position+', '+data.fName+'.  A Grub2You team member will contact you soon!',
			html: 'Thanks for applying for the role of <b>'+data.position+'</b>, '+data.fName+'.  A Grub2You team member will contact you soon!'
		};
	}

	if(template === 'placed') {
		mailOptions = {
			from: 'Grub2You <info@grub2you.com>',
			to: email,
			subject: subject,
			text: 'A new order has been placed!'
		};
	}

	if(template === 'order') {
		mailOptions = {
			from: 'Grub2You <info@grub2you.com>',
			to: email,
			subject: subject,
			text: 'Thanks for ordering with Grub2You!, '+data.fName+'.  A Grub2You team member will deliver your order very soon!',
			html: 'Thanks for ordering with <b>Grub2You</b>, '+data.fName+'.  A Grub2You team member will deliver your order very soon!'
		};
	}

	if(template === 'feedback') {
		mailOptions = {
			from: 'Grub2You <info@grub2you.com>',
			to: email,
			subject: subject,
			text: 'Feedback has been received: '+data,
			html: 'Feedback has been received. <a href="http://grub2you.com:3001/#/feedback/'+data+'">Click here to review the feedback</a>.'
		};
	}

	if(template === 'signup') {
		mailOptions = {
			from: 'Grub2You <info@grub2you.com>',
			to: email,
			subject: subject,
			text: (
				'Thanks for joining Grub2You, '+data.fName+'.  We\'re glad you found us!  ' +
				'How about a little discount when you place your first order? Just enter ' +
				'promo code \'yummy\' when you place your order at grub2you.com!'
			),
			html: (
				'Thanks for joining <b>Grub2You</b>, '+data.fName+'.  We\'re glad you ' +
				'found us!<br/>How about a little discount when you place your first ' +
				'order? Just enter promo code <b>\'yummy\'</b> when you place your ' +
				'order at <a href="grub2you.com">grub2you.com</a>!'
			),
		};
	}

	if(template === 'update') {
		mailOptions = {
			from: 'Grub2You <info@grub2you.com>',
			to: email,
			subject: subject,
			text: 'Your order has been collected from the restaurant and is on the way!'
		};
	}

	if(template === 'failed') {
		mailOptions = {
			from: 'Grub2You <info@grub2you.com>',
			to: email,
			subject: subject,
			text: 'Payment for the following order failed:  http://grub2you.com:3001/#/orderDetails/'+data
		};
	}

	console.log('   ');
	console.log('********** start mailOptions **********');
	console.log(mailOptions);
	console.log('********** end mailOptions **********');
	console.log('   ');

	transporter.sendMail(mailOptions, function(err, info) {
		if(info) {
			console.log('   ');
			console.log('********** start response info **********');
			console.log(info);
			console.log('********** end response info **********');
			console.log('   ');
		}

		if(err) {
			console.log('mailFail:');
			console.log(err);
			return p.reject(err);
		}

		console.log(template+' message sent');
		p.resolve(info);
	});

	return p.promise;
}

