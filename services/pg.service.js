const config = require('pg');
const knex = require('knex');
const { user, password } = require('./private.json');

config.types.setTypeParser(1700, parseFloat);

const pg = knex({
  client: 'pg',
  connection: {
    host: 'danfy.ctzvj9qzh3yk.us-east-2.rds.amazonaws.com',
    database: 'danfy',
    user,
    password,
  },
  searchPath: ['knex', 'danfy'],
});

module.exports = {
  pg,
};
