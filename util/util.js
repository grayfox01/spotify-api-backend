var jwt    = require('jsonwebtoken');
var Factory = require('./../factory/factory');

let Util = {};
Util.authenticate = function(req, res, next) {
    let authorization = req.headers['authorization'];
    // decode token
    if (authorization) {
      let token = authorization.split(" ")[1];
      // verifies secret and checks exp
      jwt.verify(token, 'spotifyApiBackend', function(err, decoded) {
        if (err) {
          return res.json({ error: true, data:{ message: 'Failed to authenticate token.' }});
        } else {
          next();
        }
      });
    } else {
      return res.status(403).send({
          error: true,
          data:{
            message: 'No token provided.'
          }
      });
    }
};
module.exports = Util;
