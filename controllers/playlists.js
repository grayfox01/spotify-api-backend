var Q = require("q");
var request = require('request');
var DeletedTracksController = require('./deleted_tracks').getInstance();
var moment = require('moment');

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
              timeout: 10000,
              json: true
            };
            // use the access token to access the Spotify Web API
            request.get(options, function(error, response, body) {
              if(error){
                deferred.reject({
                    status: 503,
                    message: "Server could not connect with spotifyApi"
                  });
              }else if(body.error){
                deferred.reject(body.error);
              }
              else{
                deferred.resolve(body);
              }
            });
            return deferred.promise;
          },
          findById: function(userID, playlistID, access_token) {
            let deferred1 = Q.defer();
            let url = "https://api.spotify.com/v1/users/" + userID + "/playlists/" + playlistID;
            let options = {
                url: url,
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                timeout: 10000,
                json: true
              };
              // use the access token to access the Spotify Web API
              request.get(options, function(error, response, body) {
                if(error){
                  deferred1.reject({
                      status: 503,
                      message: "Server could not connect with spotifyApi"
                    });
                }else if(body.error){
                  deferred1.reject(body.error);
                }
                else{
                  if(body.tracks.next != null){
                    let deferred2 = Q.defer();
                    getAll(userID, playlistID,100,access_token,body.tracks.items,deferred2);
                    deferred2.promise.then(data=>{
                      body.tracks.items = data.map((track,index)=>{ track.index = index; return track;})
                      deferred1.resolve(body);
                    });
                  }else{
                    deferred1.resolve(body);
                  }
                }
              });
            return deferred1.promise;
          },
          findTracks: function(userID, playlistID,offset, access_token) {
            let deferred = Q.defer();
            let url = "https://api.spotify.com/v1/users/" + userID + "/playlists/" + playlistID+"/tracks?offset="+offset;
            let options = {
                url: url,
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                timeout: 10000,
                json: true
              };
              // use the access token to access the Spotify Web API
              request.get(options, function(error, response, body) {
                if(error){
                  deferred.reject({
                      status: 503,
                      message: "Server could not connect with spotifyApi"
                    });
                }else if(body.error){
                  deferred.reject(body.error);
                }
                else{
                  deferred.resolve(body);
                }
              });
            return deferred.promise;
          },
          removeTracks: function(userID, playlistID,snapshotID, access_token,tracks) {
            let deferred = Q.defer();
            let positions = [];
            for (track of tracks) {
              positions.push(track.position);
            }
            let options = {
              url: 'https://api.spotify.com/v1/users/' + userID + '/playlists/' + playlistID + '/tracks',
              headers: {
                'Authorization': 'Bearer ' + access_token
              },
              timeout: 10000,
              body:{
                'positions' : positions,
                'snapshot_id':snapshotID
             },
              json: true
            };
            // use the access token to access the Spotify Web API
            request.delete(options, function(error, response, body) {
              if(error){
                deferred.reject({
                    status: 503,
                    message: "Server could not connect with spotifyApi"
                  });
              }else if(body.error){
                deferred.reject(body.error);
              }
              else{
                let deletedTracks = tracks.map((item)=>{
                  let deleted_track = {
                  "user_id": userID,
                  "track":item,
                  "date": moment().toDate()
                 };
                 return deleted_track;
                });
                DeletedTracksController.createAll(deletedTracks).then(data => {
                },error=>{
                  console.log(error);
                });
                deferred.resolve(body);
              }
            });
            return deferred.promise;
          }
        }
      }
      function getAll(id, playlistId,offset,access_token,array,promise){
        instance.findTracks(id,playlistId,offset,access_token).then(data => {
          if(data.next != null){
            getAll(id, playlistId,offset + 100,access_token,array.concat(data.items),promise);
          }else{
            promise.resolve(array.concat(data.items));
          }
        },error=>{
          promise.reject(error);
        });
      }
      return instance;
    };
  }())
};



module.exports = PlayListController;
