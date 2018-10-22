const mongoose = require('mongoose');
const { HOST, CONFIG } = require('../mongo.connect');

const { Schema } = mongoose;

mongoose.connect(HOST, CONFIG);

const NotaServicoSchema = new Schema({
  _id: String,
  chave: String,
  destinatario: String,
  emitente: String,
  geral: {
    dataHora: Date,
    numero: String,
    status: String,
  },
  valor: Object,
});

NotaServicoSchema.pre('save', function (next) { // eslint-disable-line
  this.chave = this.emitente + this.geral.numero;
  this._id = this.chave; // eslint-disable-line

  if (typeof this.geral.dataHora === 'string') {
    this.geral.dataHora = new Date(this.geral.dataHora);
  }
  next();
});

NotaServicoSchema.pre('findOneAndUpdate', function (next) { // eslint-disable-line
  this.chave = this._update.emitente + this._update.geral.numero;
  this._id = this._update.chave; // eslint-disable-line

  if (typeof this._update.geral.dataHora === 'string') {
    this._update.geral.dataHora = new Date(this._update.geral.dataHora);
  }
  next();
});

const NotaServico = mongoose.model('NotaServico', NotaServicoSchema, 'NotasServico');

module.exports = {
  NotaServico,
};
