const xml = require('./xml.service');
const mongo = require('./postgres.service');
const calculador = require('./calculador.service');
const pg = require('./pg.service');
const ssl = require('./ssl');

module.exports = {
  ...xml,
  ...calculador,
  ...ssl,
  ...mongo,
  ...pg,
};
