var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('./../config');
var Util = require('./../util/util');
var Factory = require('./../factory/factory');
var request = require('request');
var querystring = require('querystring');

router.get('/', Util.authenticate, function(req, res, next) {
  let data = JSON.parse(req.headers.body);
  Factory.getInstance().getController("playlist").findAll(data.id, data.access_token).then((playlists) => {
    //Error access_token expired
    if (playlists.error) {
      var options = {
        url: 'http://localhost:3000/v1/auth/refresh_token/' + data.refresh_token,
        json: true
      };
      // use refresh access_token
      request.get(options, function(error, response, body) {
        let user = {};
        user.id = data.id;
        user.access_token = body.data.access_token;
        Factory.getInstance().getController("user").update(user).then((data)=>{},(error)=>{});
        Factory.getInstance().getController("playlist").findAll(data.id, body.data.access_token).then((playlists) => {
          res.send({
            error: false,
            refresh_user:true,
            data: playlists
          });
        });
      });
    } else {
      res.send({
        error: false,
        refresh_user:false,
        data: playlists
      });
    }
  });
});

router.get('/:playlistId', Util.authenticate, function(req, res, next) {
  let data = JSON.parse(req.headers.body);
  Factory.getInstance().getController("playlist").findById(data.id, req.params.playlistId, data.access_token).then((playlist) => {
    //Error access_token expired
    if (playlist.error) {
      var options = {
        url: 'http://localhost:3000/v1/auth/refresh_token/' + data.refresh_token,
        json: true
      };
      // use refresh access_token
      request.get(options, function(error, response, body) {
        let user = {};
        user.id = data.id;
        user.access_token = body.data.access_token;
        Factory.getInstance().getController("user").update(user).then((data)=>{},(error)=>{});
        Factory.getInstance().getController("playlist").findById(data.id, req.params.playlistId, body.data.access_token).then((playlist) => {
          res.send({
            error: false,
            refresh_user:true,
            data: playlist
          });
        });
      });
    } else {
      res.send({
        error: false,
        refresh_user:false,
        data: playlist
      });
    }
  });
});

router.delete('/:playlistId/tracks', Util.authenticate, function(req, res, next) {
  let data = JSON.parse(req.headers.body);
  Factory.getInstance().getController("playlist").removeTracks(data.id, req.params.playlistId, data.access_token, data.tracks).then((status) => {
    //Error access_token expired
    if (status.error) {
      var options = {
        url: 'http://localhost:3000/v1/auth/refresh_token/' + user.refresh_token,
        json: true
      };
      // use refresh access_token
      request.get(options, function(error, response, body) {
        let user = {};
        user.id = data.id;
        user.access_token = body.data.access_token;
        Factory.getInstance().getController("user").update(user).then((data)=>{},(error)=>{});
        Factory.getInstance().getController("playlist").removeTracks(data.id, req.params.playlistId, data.access_token, data.tracks).then((status) => {
          res.send({
            error: false,
            refresh_user:true,
            data: status
          });
        });
      });
    } else {
      res.send({
        error: false,
        refresh_user:false,
        data: status
      });
    }
  });
});

module.exports = router;
