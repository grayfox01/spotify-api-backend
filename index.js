var express = require('express');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var cors = require('cors');
// Get our API routes
var api = require('./routes/api');
// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Parsers for cookies
app.use(cookieParser());
app.use(cors());

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));
// Set our api routes
app.use('/v1', api);
// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});
/** Get port from environment and store in Express.*/
var port = process.env.PORT || '3000';
app.set('port', port);
/*** Create HTTP server.*/
var server = http.createServer(app);
/*** Listen on provided port, on all network interfaces.*/
server.listen(port, () => console.log(`API running on localhost:${port}`));
