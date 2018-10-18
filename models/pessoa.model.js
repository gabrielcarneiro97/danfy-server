const mongoose = require('mongoose');
const { Schema } = require('mongoose');

mongoose.connect('mongodb://localhost:27017');

const Movimento = new Schema({
  conferido: Boolean,
  data: String,
  dominio: String,
  metaDados: Object,
  notaFinal: String,
  notaInicial: String,
  valores: Object,
});

const Pessoa = mongoose.model('Pessoa', {
  _id: String,
  nome: String,
  endereco: Object,
  Movimentos: [Movimento],
}, 'Pessoas');

module.exports = {
  Pessoa,
};
