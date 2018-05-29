const xml = require('./xml.service');
const firebase = require('./firebase.service');
const calculador = require('./calculador.service');

module.exports = {
  ...xml,
  ...firebase,
  ...calculador,
};
