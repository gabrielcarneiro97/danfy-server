const calculador = require('./calculador.service');
const pg = require('./pg.service');
const ssl = require('./ssl');

module.exports = {
  ...calculador,
  ...ssl,
  ...pg,
};
