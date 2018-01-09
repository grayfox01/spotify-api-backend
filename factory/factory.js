var UserController = require('./../controllers/users');
var PlaylistController = require('./../controllers/playlists');
var AuthController = require('./../controllers/auth');
var DeletedTracksController = require('./../controllers/deleted_tracks');

var factory = {
  getInstance: (function() {
    var instance;
    return function() {
      if (!instance) {
        instance = {
          getController : function (type) {
              var controller;
              if (type === "user") {
                  controller = UserController.getInstance();
              }else if (type === "playlist") {
                  controller = PlaylistController.getInstance();
              }else if (type === "auth") {
                  controller = AuthController.getInstance();
              }else if (type === "deleted_track") {
                  controller = DeletedTracksController.getInstance();
              }
              return controller;
          }
        }
      }
      return instance;
    };
  }())
};

module.exports = factory;
