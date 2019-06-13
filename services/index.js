const xml = require('./xml.service');
const calculador = require('./calculador.service');
const pg = require('./pg.service');
const ssl = require('./ssl');

module.exports = {
  ...xml,
  ...calculador,
  ...ssl,
  ...pg,
};
