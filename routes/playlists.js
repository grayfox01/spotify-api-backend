var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('./../config');
var Util = require('./../util/util');
var Factory = require('./../factory/factory');
var request = require('request');
var querystring = require('querystring');

router.get('/userId/:userId', Util.authenticate, function(req, res, next) {
  Factory.getInstance().getController("user").findById(req.params.userId).then(user => {
    Factory.getInstance().getController("playlist").findAll(user.id,user.access_token).then((playlists) => {
      //Error access_token expired
      if (playlists.error) {
        var options = {
          url: 'http://localhost:3000/v1/auth/refresh_token/' + user.refresh_token,
          json: true
        };
        // use refresh access_token
        request.get(options, function(error, response, body) {
          console.log(body);
          Factory.getInstance().getController("user").update({
            id: req.params.userId,
            access_token: body.data.access_token
          }).then(data => {
          }, error => {
          })
          let result2 = Factory.getInstance().getController("playlist").findAll(user.id,body.data.access_token);
          result2.then((playlists2) => {
            console.log(playlists2);
            res.send({
              error: false,
              data: playlists2
            });
          });
        });
      } else {
        res.send({
          error: false,
          data: playlists
        });
      }
    });
  }, error => {
    console.log(error);
  })
});

router.get('/:id', Util.authenticate, function(req, res, next) {
  res.send(null);
});

router.get('/:id/tracks', Util.authenticate, function(req, res, next) {
  res.send(null);

});

router.post('/', Util.authenticate, function(req, res, next) {
  res.send(null);

});

router.put('/', Util.authenticate, function(req, res, next) {
  res.send(null);
});

router.delete('/:id', Util.authenticate, function(req, res, next) {
  res.send(null);

});

router.delete('/:id/tracks', Util.authenticate, function(req, res, next) {
  res.send(null);
});

module.exports = router;
