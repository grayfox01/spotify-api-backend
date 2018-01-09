var express = require('express');
var router = express.Router();
var DeletedTracksController = require('./../factory/factory').getInstance().getController("deleted_track");
var Util = require('./../util/util');
var moment = require('moment');
var AuthController = require('./../factory/factory').getInstance().getController("auth");
var jwt = require('jsonwebtoken');
var config = require('./../config');
var Q = require("q");

let deleted_tracks = function(io) {

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
            let body;
            if (req.headers.body) {
              body = body = JSON.parse(req.headers.body);
            }
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
    DeletedTracksController.findAllByUserId(payload.id).then(data => {
      res.status(200).send(data);
    }, error => {
      res.status(error.status).send(error);
    });
  });

  router.get('/day/:date', function(req, res, next) {
    let payload = req.payload;
    DeletedTracksController.findAllByUserIdAndDate(payload.id, req.params.date).then(data => {
      res.status(200).send(data);
    }, error => {
      res.status(error.status).send(error);
    });
  });

  return router;
}

module.exports = deleted_tracks;
