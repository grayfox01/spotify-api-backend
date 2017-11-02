var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var jwt    = require('jsonwebtoken');
var config = require('./../config');
var Factory = require('./../factory/factory');
var request = require('request');
var querystring = require('querystring');
var client_id = '8bbc6555ac95450a8bbddba56fa56c40'; // Your client id
var client_secret = '29682ddfd6634dcfb1c2a1462eac5497'; // Your secret
var redirect_uri = 'http://localhost:3000/v1/auth/callback'; // Your redirect uri
var stateKey = 'spotify_auth_state';
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  res.cookie('type', 'login');
  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

router.get('/signup', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  res.cookie('type', 'signup');
  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

router.post('/login',function(req,res,next) {
  if(req.body.email && req.body.password){
    let result = Factory.getInstance().getController("user").findByEmail(req.body.email);
    result.then((data)=> {
      var encryptedPassw = crypto.createHash('sha256').update(req.body.password).digest('base64');
      console.log(encryptedPassw);
      if(data && encryptedPassw == data.password){
        let user = {};
        user.id = data.id;
        user.token = jwt.sign(user.id,config.secret);
        res.status(200).send({
          error:false,
          data: user
        });
      }else{
        res.status(403).send({
            error: true,
            data:{
              message: 'User credentials invalid.'
            }
        });
      }
    },(error)=>{
      res.status(400).send({
          error: true,
          data:{
            message: error.message
          }
      });
    });
  }else{
    res.status(403).send({
        error: true,
        data:{
          message: 'User credentials not provided.'
        }
    });
  }
});

router.post('/signup',function(req,res,next){
  let user = req.body;
  user.password = crypto.createHash('sha256').update(user.password).digest('base64');
  let result = Factory.getInstance().getController("user").create(user);
  result.then((data)=>{
    console.log(data);
    res.status(200).send({error:false, 'data' : data});
  },(error)=>{
    res.status(400).send(error);
  });
});

router.get('/callback', function(req, res) {

  // your application requests relient_id=8bbc6555ac95450a8bbddba56fa56c40#_=_fresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          var user = {};
          res.clearCookie('type');
          if(req.cookies['type']=='login'){
            user.id = body.id;
            user.token = jwt.sign(user.id,config.secret);
          }else if(req.cookies['type']=='signup'){
            user.id = body.id;
            user.country = body.country;
            user.display_name = body.display_name;
            user.email = body.email;
            user.uri = body.uri;
            user.access_token = access_token;
            user.refresh_token = refresh_token;
          }
          let data = querystring.stringify(user);
          res.redirect('http://localhost:4200/'+req.cookies['type']+'?'+data);
        });
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

router.get('/refresh_token/:refresh_token', function(req, res) {
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: req.params.refresh_token
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          error:false,
          data:{
           'access_token': access_token
          }
        });
      }else{
        res.send({error:true,data:{ message:body.error_description }});
      }
    });
});


module.exports = router;
