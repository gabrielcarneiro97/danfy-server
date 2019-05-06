const config = require('pg');

config.types.setTypeParser(1700, parseFloat);

const pg = require('knex')({
  client: 'pg',
  connection: 'postgres://postgres:123456@localhost/danfy',
  searchPath: ['knex', 'danfy'],
});

module.exports = {
  pg,
};
