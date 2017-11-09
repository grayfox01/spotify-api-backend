'use strict';
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
      table.string('id').primary();
      table.string('country');
      table.string('display_name');
      table.string('email').unique();
      table.string('uri');
      table.text('token');
      table.text('access_token');
      table.text('refresh_token');
    });
};
exports.down = function(knex) {
      return knex.schema.dropTable('users');
};
