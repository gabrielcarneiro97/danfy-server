const xml = require('./xml.service');
const mongo = require('./mongoose.service');
const calculador = require('./calculador.service');
const ssl = require('./ssl');

module.exports = {
  ...xml,
  ...calculador,
  ...ssl,
  ...mongo,
};
