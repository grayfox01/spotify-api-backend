var mongoose = require('mongoose');

var schema = mongoose.Schema(
  {
  "user_id": String,
  "track" : mongoose.Schema.Types.Mixed ,
  "date": Date
});

module.exports = mongoose.model('DeletedTracks', schema);
