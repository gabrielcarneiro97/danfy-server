const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017');

const Nota = mongoose.model('Nota', {
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
    dataHora: String,
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
}, 'Notas');

module.exports = {
  Nota,
};
