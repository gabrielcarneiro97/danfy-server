const xml = require('./xml.service');
const firebase = require('./firebase.service');
const mongo = require('./mongo.service');
const calculador = require('./calculador.service');
const ssl = require('./ssl');

module.exports = {
  ...xml,
  ...firebase,
  ...calculador,
  ...ssl,
  ...mongo,
};
