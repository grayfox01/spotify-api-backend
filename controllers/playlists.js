var Q = require("q");
var request = require('request');

var PlayListController = {
  getInstance: (function() {

    var instance;
    return function() {
      if (!instance) {
        instance = {
          findAll: function(userID, access_token) {
            let deferred = Q.defer();
            let options = {
              url: 'https://api.spotify.com/v1/users/' + userID + '/playlists',
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
          findById: function(userID, playlistID, access_token) {
            let deferred = Q.defer();
            try {
              let url = "https://api.spotify.com/v1/users/" + userID + "/playlists/" + playlistID;
              let options = {
                url: url,
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                json: true
              };
              // use the access token to access the Spotify Web API
              request.get(options, function(error, response, body) {
                console.log(error);
                deferred.resolve(body);
              });
            } catch (e) {
              deferred.reject({
                error: true,
                data: {
                  message: e
                }
              });
            }
            return deferred.promise;
          },
          removeTracks: function(userID, playlistID, access_token,tracks) {
            console.log(tracks);
            let deferred = Q.defer();
            let options = {
              url: 'https://api.spotify.com/v1/users/' + userID + '/playlists/' + playlistID + '/tracks',
              headers: {
                'Authorization': 'Bearer ' + access_token
              },
              body:JSON.parse(tracks),
              json: true
            };
            // use the access token to access the Spotify Web API
            request.delete(options, function(error, response, body) {
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
