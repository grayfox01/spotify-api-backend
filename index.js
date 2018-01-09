var express = require('express');
var path = require('path');
var config = require('./config');
var jwt    = require('jsonwebtoken');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
//Using socket.io
app.set('socketio', io);
var cors = require('cors');
// Get our API routes
var api = require('./routes/api');
// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Parsers for cookies
app.use(cookieParser());
// Permit cross origin
app.use(cors());
// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));
// Set our api routes
app.use('/v1', api(io));
// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

io.use(function(socket, next){
  let token = socket.handshake.query.token;
  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
      next(new Error('authentication error'));
    } else {
      next();
    }
  });
});

io.on('connection', function(socket){
  let token = socket.handshake.query.token;
  let decoded = jwt.verify(token, 'spotifyApiBackend');
  socket.join(decoded.id);
  console.log('a user connected');
  socket.emit('connected',{ message:"welcome to our server" });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});


http.listen((process.env.PORT || 3000), function () {
  console.log('***** exp listening on port: ' + (process.env.PORT || 3000));
  mongoose.connect('mongodb://localhost/proyectoDS2');
});

module.exports = app;
