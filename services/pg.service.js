const config = require('pg');
const knex = require('knex');
const { user, password } = require('./private.json');

config.types.setTypeParser(1700, parseFloat);

const isDev = process.env.DEV;

const pg = knex({
  client: 'pg',
  connection: {
    host: isDev ? 'ec2-13-58-192-2.us-east-2.compute.amazonaws.com' : 'localhost',
    database: 'danfy',
    user,
    password,
  },
  searchPath: ['knex', 'danfy'],
});

module.exports = {
  pg,
};
