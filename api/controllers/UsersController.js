/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var bcrypt = require('bcrypt');

var loginError = 'Invalid username, email, or password.';
var serverError = 'An error occurred. Please try again later.';
var nextUrl = '/#/';
var loginUrl = '/login';
var layout = 'users/loginLayout';
var view = 'login';

module.exports = {
  login: function(req, res) {
    var isAjax = req.headers.accept.match(/application\/json/);

    if(req.session.isAuthenticated) {
      if(isAjax) {
        return res.send(JSON.stringify({
          success: true
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
  }
};

function processLogin(req, res, self) {
  Users.findOne({or: [
    {username: req.body.username},
    {email: req.body.username}
  ]}).then(function(user) {
    if(! user) return errorHandler(loginError)();

    var onCompare = bcrypt.compareAsync(
      req.body.password, user.password
    );
    onCompare.then(function(match) {
      if(! match) return errorHandler(loginError)();

      req.session.isAuthenticated = true;
      req.session.user = user.id;

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
      return res.send(JSON.stringify({success: true}));
    }

    return res.redirect(nextUrl);
  };

  function errorHandler(errMsg) {
    return function(err) {
      if(err) console.error(err);
      respond(errMsg);
    };
  };
}

