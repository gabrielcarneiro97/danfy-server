import * as config from 'pg';
import * as knex from 'knex';
import * as fs from 'fs';

const { user, password } = require('./private.json');

config.types.setTypeParser(1700, parseFloat);
config.defaults.ssl = true;

export const cert = fs.readFileSync(`${__dirname}/rds-ca-2019-root.pem`, 'utf8');

export const pg = knex({
  client: 'pg',
  connection: {
    database: 'danfy',
    host: 'danfy.ctzvj9qzh3yk.us-east-2.rds.amazonaws.com',
    user,
    password,
    ssl: false,
    // ssl: {
    //   root: cert,
    // },
  },
  searchPath: ['knex', 'danfy'],
});
