var Q = require("q");
var request = require('request');
var jwt    = require('jsonwebtoken');
var config = require('./../config');
var moment = require('moment');
var querystring = require('querystring');
var client_id = '8bbc6555ac95450a8bbddba56fa56c40'; // Your client id
var client_secret = '29682ddfd6634dcfb1c2a1462eac5497'; // Your secret
var redirect_uri = 'http://localhost:3000/v1/auth/callback'; // Your redirect uri
var scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative';
var UserController = require('./users').getInstance();

var AuthController = {
  getInstance: (function() {

    var instance;
    return function() {
      if (!instance) {
        instance = {
          getAuthURL: function(state) {

            return 'https://accounts.spotify.com/authorize?' +
              querystring.stringify({
                response_type: 'code',
                client_id: client_id,
                scope: scope,
                redirect_uri: redirect_uri,
                state: state
              });
          },
          generateRandomString : function(length) {
            var text = '';
            var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

            for (var i = 0; i < length; i++) {
              text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
          },
          refreshToken:function(refresh_token) {
            let deferred = Q.defer();
            var authOptions = {
              url: 'https://accounts.spotify.com/api/token',
              headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
              },
              form: {
                grant_type: 'refresh_token',
                'refresh_token': refresh_token
              },
              json: true
            };

            request.post(authOptions, function(error, response, body) {
              if(error){
                deferred.reject({
                    status: 503,
                    message: "Server could not connect with spotifyApi"
                  });
              }else if(body.error){
                deferred.reject(body.error);
              }
              else{
                deferred.resolve(body.access_token);
              }
            });
            return deferred.promise;
          },
          getToken: function(code) {
            let deferred = Q.defer();
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
                    refresh_token = body.refresh_token,
                    expires_in = body.expires_in;
                var options = {
                  url: 'https://api.spotify.com/v1/me',
                  headers: { 'Authorization': 'Bearer ' + access_token },
                  json: true
                };
                // use the access token to access the Spotify Web API
                request.get(options, function(error, response, body) {
                  let payload = {
                    id: body.id,
                    refresh_token: refresh_token,
                    access_token:access_token,
                    exp_date : moment().add(expires_in, 'seconds').unix()
                  };
                  let token = jwt.sign(payload,config.secret);
                  let data = querystring.stringify({ token : token , state:'spotifyApi'});
                  deferred.resolve(data);
                  UserController.findById(body.id).then((user)=>{
                  },(error)=>{
                    var user = {};
                    user.id = body.id;
                    user.country = body.country;
                    user.display_name = (body.display_name!=null)?body.display_name: body.id;
                    user.email = body.email;
                    UserController.create(user).then(data=>{
                    },error=>{
                      console.log("error",error);
                    });
                  });
                });

              } else {
                deferred.reject({
                    status: 401,
                    message: "invalid_token"
                  });
              }});
            return deferred.promise;
          }
        }
      }
      return instance;
    };
  }())
};

module.exports = AuthController;
