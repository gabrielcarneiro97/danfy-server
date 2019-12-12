const config = require('pg');
const knex = require('knex');
const { user, password } = require('./private.json');

config.types.setTypeParser(1700, parseFloat);
config.defaults.ssl = true;

const pg = knex({
  client: 'pg',
  connection: `postgres://${user}:${password}@danfy.ctzvj9qzh3yk.us-east-2.rds.amazonaws.com:5432/danfy?ssl=true`,
  searchPath: ['knex', 'danfy'],
});

module.exports = {
  pg,
};
