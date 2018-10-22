const mongoose = require('mongoose');
const { HOST, CONFIG } = require('../mongo.connect');

const { Schema } = mongoose;

mongoose.connect(HOST, CONFIG);

const NotaSchema = new Schema({
  _id: String,
  chave: String,
  destinatario: String,
  emitente: String,
  complementar: {
    notaReferencia: String,
    textoComplementar: String,
  },
  geral: {
    cfop: String,
    dataHora: Date,
    numero: String,
    status: String,
    tipo: String,
  },
  informacoesEstaduais: {
    destinatarioContribuinte: String,
    estadoDestino: String,
    estadoGerador: String,
  },
  produtos: Object,
  valor: {
    total: String,
  },
});


NotaSchema.pre('save', function (next) { // eslint-disable-line
  if (typeof this.geral.dataHora === 'string') {
    this.geral.dataHora = new Date(this.geral.dataHora);
  }
  next();
}, err => console.log(err));

NotaSchema.pre('findOneAndUpdate', function (next) { // eslint-disable-line
  if (typeof this._update.geral.dataHora === 'string') {
    this._update.geral.dataHora = new Date(this._update.geral.dataHora);
  }
  next();
}, err => console.log(err));

const Nota = mongoose.model('Nota', NotaSchema, 'Notas');

module.exports = {
  Nota,
};
