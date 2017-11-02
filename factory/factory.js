var UserController = require('./../controllers/users');
var ProfileController = require('./../controllers/profiles');
var PlaylistController = require('./../controllers/playlists');

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
              }else if (type === "profile") {
                  controller = ProfileController.getInstance();
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
