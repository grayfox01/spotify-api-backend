'use strict';
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
      table.string('id').primary();
      table.string('country');
      table.string('display_name');
      table.string('email').unique();
    });
};
exports.down = function(knex) {
      return knex.schema.dropTable('users');
};
