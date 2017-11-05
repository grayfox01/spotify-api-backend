var User = require('../models/user');
var Q = require("q");

var UserController = {
  getInstance: (function() { // BEGIN iife
    var instance;
    return function() {
      if (!instance) {
        instance = {
          findAll: function() {
            var deferred = Q.defer();
            try {
              console.log("consultando usuarios");
              User.forge()
                .fetchAll()
                .then(function(collection) {
                  console.log("usuarios:", collection);
                  deferred.resolve(collection.toJSON());
                })
                .catch(function(err) {
                  console.log("Error:", err, message);
                  deferred.reject({
                    error: true,
                    data: {
                      message: err.message
                    }
                  });
                });
            } catch (error) {
              deferred.reject({
                error: true,
                data: {
                  message: error
                }
              });
            }
            return deferred.promise;
          },
          findById: function(id) {
            var deferred = Q.defer();
            User.forge({
                'id': id
              })
              .fetch()
              .then(function(user) {
                if (!user) {
                  deferred.reject({
                    error: true,
                    data: 'user not found'
                  });
                } else {
                  deferred.resolve(user.toJSON());
                }
              })
              .catch(function(err) {
                deferred.reject({
                  error: true,
                  data: {
                    message: err.message
                  }
                });
              });
            return deferred.promise;
          },
          findByEmail: function(email) {
            var deferred = Q.defer();
            User.forge({
                'email': email
              })
              .fetch()
              .then(function(user) {
                if (!user) {
                  deferred.reject({
                    error: true,
                    data: 'user not found'
                  });
                } else {
                  deferred.resolve(user.toJSON());
                }
              })
              .catch(function(err) {
                deferred.reject({
                  error: true,
                  data: {
                    message: err.message
                  }
                });
              });
            return deferred.promise;
          },
          create: function(user) {
            var deferred = Q.defer();
            User.forge(user)
              .save(null, {
                method: 'insert'
              })
              .then(function(userC) {
                deferred.resolve({
                  error: false,
                  data: {
                    message: "User created with id " + userC.get('id')
                  }
                });
              })
              .catch(function(err) {
                deferred.reject({
                  error: true,
                  data: {
                    message: err.message
                  }
                });
              });
            return deferred.promise;
          },
          update: function(userU) {
            var deferred = Q.defer();
            User.forge({
                id: userU.id
              })
              .fetch({
                require: true
              })
              .then(function(user) {
                user.save(userU)
                  .then(function() {
                    deferred.resolve({
                      error: false,
                      data: {
                        message: 'Contact updated'
                      }
                    });
                  })
                  .catch(function(err) {
                    deferred.reject({
                      error: true,
                      data: {
                        message: err.message
                      }
                    });
                  });
              })
              .catch(function(err) {
                deferred.reject({
                  error: true,
                  data: {
                    message: err.message
                  }
                });
              });
            return deferred.promise;
          },
          remove: function(id) {
            var deferred = Q.defer();
            User.forge({
                'id': id
              })
              .fetch({
                require: true
              })
              .then(function(user) {
                user.destroy()
                  .then(function() {
                    deferred.resolve({
                      error: false,
                      data: {
                        message: 'Contact deleted'
                      }
                    });
                  })
                  .catch(function(err) {
                    deferred.reject({
                      error: true,
                      data: {
                        message: err.message
                      }
                    });
                  });
              })
              .catch(function(err) {
                deferred.reject({
                  error: true,
                  data: {
                    message: err.message
                  }
                });
              });
            return deferred.promise;
          }

        }
      }
      return instance;
    };
  }()) // END iife
};

module.exports = UserController;
