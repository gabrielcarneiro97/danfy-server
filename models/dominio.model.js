const mongoose = require('mongoose');
const { HOST, CONFIG } = require('../mongo.connect');

const { Schema } = mongoose;

mongoose.connect(HOST, CONFIG);

const dominioSchema = new Schema({
  _id: String,
  tipo: String,
  empresa: String,
  dominioPai: String,
  empresas: Object,
});

const Dominio = mongoose.model('Dominio', dominioSchema, 'Dominios');

module.exports = {
  Dominio,
};
