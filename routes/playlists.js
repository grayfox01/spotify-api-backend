var express = require('express');
var router = express.Router();
var PlaylistController = require('./../factory/factory').getInstance().getController("playlist");
var DeletedTracksController = require('./../factory/factory').getInstance().getController("deleted_track");
var Util = require('./../util/util');
var moment = require('moment');
var AuthController = require('./../factory/factory').getInstance().getController("auth");
var jwt = require('jsonwebtoken');
var config = require('./../config');
var Q = require("q");

let playlists = function(io) {

  router.use(function(req, res, next) {
    if (req.payload) {
      let body;
      if (req.headers.body) {
        body = body = JSON.parse(req.headers.body);
      }
      var payload = req.payload;
      if (payload.exp_date <= moment().unix()) {
        AuthController.refreshToken(payload.refresh_token).then(data => {
          payload.access_token = data;
          payload.exp_date = moment().add(3600, 'seconds').unix();
          let token = jwt.sign(payload, config.secret);
          if (body && body.socket_id) {
            io.sockets.connected[body.socket_id].emit("refresh_token", token);
          }
          req.token = token;
          req.payload = payload;
          next();
        }, error => {
          res.status(error.status).send(error);
        });
      } else {
        next();
      }
    } else {
      let authorization = req.headers['authorization'];
      let body;
      if (req.headers.body) {
        body = body = JSON.parse(req.headers.body);
      }
      // decode token
      if (authorization) {
        var token = authorization.split(" ")[1];
        // verifies secret and checks exp
        jwt.verify(token, config.secret, function(err, decoded) {
          if (err) {
            return res.status(401).send({
              error: true,
              data: {
                message: 'Failed to authenticate token.'
              }
            });
          } else {
            if (decoded.exp_date <= moment().unix()) {
              AuthController.refreshToken(decoded.refresh_token).then(data => {
                try {
                  decoded.access_token = data;
                  decoded.exp_date = moment().add(3600, 'seconds').unix();
                  token = jwt.sign(decoded, config.secret);
                  if (body && body.socket_id) {
                    io.sockets.connected[body.socket_id].emit("refresh_token", token);
                  }
                  req.token = token;
                  req.payload = decoded;
                  next();
                } catch (e) {
                  console.log(e);
                }
              }, error => {
                res.status(error.status).send(error);
              });
            } else {
              req.token = token;
              req.payload = decoded;
              next();
            }
          }
        });
      } else {
        return res.status(403).send({
          error: true,
          data: {
            message: 'No token provided.'
          }
        });
      }
    }
  });

  router.get('/', function(req, res, next) {
    let payload = req.payload;
    PlaylistController.findAll(payload.id, payload.access_token).then(data => {
      let playlists = data.items.filter(function(playlist) {
        return playlist.owner.id == payload.id;
      });
      playlists = playlists.map((item, index) => {
        let playlist = {
          id: item.id,
          snapshot_id: item.snapshot_id,
          images: item.images,
          name: item.name,
          owner: item.owner
        };
        playlist.total_tracks = item.tracks.total;
        return playlist;
      });
      res.status(200).send(playlists);
    }, error => {
      res.status(error.status).send(error);
    });
  });

  router.get('/:playlistId', function(req, res, next) {
    let payload = req.payload;
    PlaylistController.findById(payload.id, req.params.playlistId, payload.access_token).then(data => {
      let tracks = data.tracks.items.map((item, position) => {
        let artists = item.track.artists.map((item) => {
          return item.name;
        });
        let album = {
          id: item.track.album.id,
          name: item.track.album.name,
          uri: item.track.album.uri
        };
        let playlist = {
          id: data.id,
          name: data.name,
          uri: data.uri
        };
        let track = {
          id: item.track.id,
          album: album,
          artists: artists,
          name: item.track.name,
          uri: item.track.uri,
          playlist: playlist,
          position: position
        };
        return track;
      });
      let result = Util.findDuplicateds(tracks);
      let playlist = {
        id: data.id,
        snapshot_id: data.snapshot_id,
        images: data.images,
        name: data.name,
        owner: data.owner,
        tracks: result,
        total_tracks: data.tracks.total
      };
      res.status(200).send(playlist);
    }, error => {
      res.status(error.status).send(error);
    });
  });

  router.delete('/:playlistId/tracks', function(req, res, next) {
    let payload = req.payload;
    let body;
    if (req.headers.body) {
      body = body = JSON.parse(req.headers.body);
    }
    PlaylistController.removeTracks(payload.id, req.params.playlistId, body.snapshot_id, payload.access_token, body.tracks).then(data => {
      res.status(200).send(data);
      if (body && body.socket_id) {
        io.sockets.connected[body.socket_id].to(payload.id).emit('refresh_playlist', {
          message: "refresh playlist",
          id: req.params.playlistId
        });
      }
    });
  });

  return router;
}

module.exports = playlists;
