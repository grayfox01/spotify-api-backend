var express = require('express');
var router = express.Router();
var stateKey = 'spotify_auth_state';
var AuthController = require('./../factory/factory').getInstance().getController("auth");
var querystring = require('querystring');

let auth = function(io) {

  router.get('/authorize', function(req, res) {
    var state = AuthController.generateRandomString(16);
    res.cookie(stateKey, state);
    // your application requests authorization
    res.redirect(AuthController.getAuthURL(state));
  });

  router.get('/callback', function(req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
      res.redirect('/restricted' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      AuthController.getToken(code).then(data => {
        res.redirect('http://localhost:3000/callback?' + data);
      }, error => {
        res.status(error.status).send(error);
      });
    }
  });
  return router;
}

module.exports = auth;
