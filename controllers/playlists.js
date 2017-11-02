var Q = require("q");
var request = require('request');

var PlayListController = {
  getInstance: (function() {
    var instance;
    return function() {
      if (!instance) {
        instance = {
          findAll: function(userID,access_token) {
            var deferred = Q.defer();
            var options = {
              url: 'https://api.spotify.com/v1/users/'+userID+'/playlists',
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
          findById: function(userID,playlistID,access_token) {
            var deferred = Q.defer();
            var options = {
              url: 'https://api.spotify.com/v1/users/'+userID+'/playlists/'+playlistsID,
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
          removeTracks: function(tracks) {
            var deferred = Q.defer();
            var options = {
              url: 'https://api.spotify.com/v1/users/'+userID+'/playlists/'+playlistsID+'/tracks',
              headers: {
                'Authorization': 'Bearer ' + access_token
              },
              json: true
            };
            // use the access token to access the Spotify Web API
            request.delete(options,tracks,function(error, response, body) {
              deferred.resolve(body);
            });
            return deferred.promise;
          }
        }
      }
      return instance;
    };
  }())
};

module.exports = PlayListController;
