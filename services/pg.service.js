const config = require('pg');
const knex = require('knex');
const fs = require('fs');
const { user, password } = require('./private.json');

config.types.setTypeParser(1700, parseFloat);
config.defaults.ssl = true;

const cert = fs.readFileSync(`${__dirname}/rds-ca-2019-root.pem`);

const pg = knex({
  client: 'pg',
  connection: {
    database: 'danfy',
    host: 'danfy.ctzvj9qzh3yk.us-east-2.rds.amazonaws.com',
    user,
    password,
    ssl: {
      root: cert,
    },
  },
  searchPath: ['knex', 'danfy'],
});

module.exports = {
  pg,
};
