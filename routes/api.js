var express = require('express');
var router = express.Router();
// get our config file
var config = require('./../config');
// Set our api routes
var playlists = require('./playlists');
var users = require('./users');
var authentication = require('./authentication');

router.use('/auth', authentication);
router.use('/users', users);
router.use('/playlists', playlists);

router.get('/',function(req,res,next){
  res.send("welcome to our api");
});

module.exports = router;
