var DeletedTracks = require('../models/deleted_tracks');
var Q = require("q");
var moment = require('moment');

var DeletedTracksController = {
  getInstance: (function() { // BEGIN iife
    var instance;
    return function() {
      if (!instance) {
        instance = {
          findById: function(id) {
            var deferred = Q.defer();
            DeletedTracks.find({'_id':id}, function (err, data) {
              if(err){
                deferred.reject({
                    status: 503,
                    message: "Error al buscar los objetos"
                  });
              }
              else{
                deferred.resolve(data);
              }
            });
            return deferred.promise;
          },
          findAllByUserId: function(user_id) {
            var deferred = Q.defer();
            DeletedTracks.find({'user_id':user_id}, function (err, data) {
              if(err){
                deferred.reject({
                    status: 503,
                    message: "Error al buscar los objetos"
                  });
              }
              else{
                deferred.resolve(data);
              }
            });
            return deferred.promise;
          },
          findAllByUserIdAndMonth: function(user_id,dateString) {
            var deferred = Q.defer();
            let date1 = moment(dateString);
            let date2 = moment(date1).add(1, 'month');
            DeletedTracks.find({'user_id':user_id,'date': { $gte: date1, $lt: date2}}, function (err, data) {
              if(err){
                deferred.reject({
                    status: 503,
                    message: "Error al buscar los objetos"
                  });
              }
              else{
                deferred.resolve(data);
              }
            });
            return deferred.promise;
          },
          findAllByUserIdAndYear: function(user_id,dateString) {
            var deferred = Q.defer();
            let date1 = moment(dateString);
            let date2 = moment(date1).add(1, 'year');
            DeletedTracks.find({'user_id':user_id,'date': { $gte: date1, $lt: date2}}, function (err, data) {
              if(err){
                deferred.reject({
                    status: 503,
                    message: "Error al buscar los objetos"
                  });
              }
              else{
                deferred.resolve(data);
              }
            });
            return deferred.promise;
          },
          findAllByUserIdAndDate: function(user_id,dateString) {
            var deferred = Q.defer();
            let date1 = moment(dateString);
            let date2 = moment(date1).add(1, 'days');
            DeletedTracks.find({'user_id':user_id,'date': { $gte: date1, $lt: date2}},null, {sort: {'track.name': 1}}, function (err, data) {
              if(err){
                deferred.reject({
                    status: 503,
                    message: "Error al buscar los objetos"
                  });
              }
              else{
                deferred.resolve(data);
              }
            });
            return deferred.promise;
          },
          createAll: function(array) {
            var deferred = Q.defer();
            DeletedTracks.create(array, function (err) {
              if(err){
                deferred.reject({
                    status: 503,
                    message: "Error al crear los objetos"
                  });
              }
              else{
                deferred.resolve({"message":"all deleteds tracks created"});
              }
            });
            return deferred.promise;
          }
        }
      }
      return instance;
    };
  }()) // END iife
};

module.exports = DeletedTracksController;
