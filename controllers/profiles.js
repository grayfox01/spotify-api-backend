var Q = require("q");
var request = require('request');

var ProfilesController = {
  getInstance: (function() {
    var instance;
    return function() {
      if (!instance) {
        instance = {
          findCurrent: function(access_token) {
            var deferred = Q.defer();
            var options = {
              url: 'https://api.spotify.com/v1/me',
              headers: {
                'Authorization': 'Bearer ' + access_token
              },
              json: true
            };
            // use the access token to access the Spotify Web API
            request.get(options, function(error, response, body) {
              deferred.resolve(body);
            });
            return deferred.promise;
          },
          findById: function(access_token, id) {
            var deferred = Q.defer();
            var options = {
              url: 'https://api.spotify.com/v1/users/' + id,
              headers: {
                'Authorization': 'Bearer ' + access_token
              },
              json: true
            };
            // use the access token to access the Spotify Web API
            request.get(options, function(error, response, body) {
              deferred.resolve(body);
            });
            return deferred.promise;
          }
        }
      }
      return instance;
    };
  }()) // END iife
};

module.exports = ProfilesController;
