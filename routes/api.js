var express = require('express');
var router = express.Router();
// get our config file
var config = require('./../config');
// Set our api routes
var playlists = require('./playlists');
var deleted_tracks = require('./deleted_tracks');
var users = require('./users');
var auth = require('./auth');

let api = function(io) {
  router.use('/auth', auth(io));
  router.use('/users', users(io));
  router.use('/playlists', playlists(io));
  router.use('/deleted_tracks', deleted_tracks(io));

  router.get('/', function(req, res, next) {
    res.send("welcome to our api");
  });

  return router;
}

module.exports = api;
