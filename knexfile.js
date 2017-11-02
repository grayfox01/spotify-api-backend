'use strict';
var config = require('./config');
module.exports = {
  client: 'mysql2',
  connection: config.database + '?ssl=true',
  useNullAsDefault: true,
};
