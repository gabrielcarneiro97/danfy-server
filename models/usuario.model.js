const mongoose = require('mongoose');
const { HOST, CONFIG } = require('../mongo.connect');

const { Schema } = mongoose;

mongoose.connect(HOST, CONFIG);

const usuarioSchema = new Schema({
  _id: String,
  nome: String,
  nivel: String,
  dominio: String,
});

const Usuario = mongoose.model('Usuario', usuarioSchema, 'Usuarios');

module.exports = {
  Usuario,
};
