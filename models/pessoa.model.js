const mongoose = require('mongoose');
const { HOST, CONFIG } = require('../mongo.connect');


const { Schema } = mongoose;
const { Decimal128 } = Schema.Types;

mongoose.connect(HOST, CONFIG);

const MovimentoSchema = new Schema({
  conferido: Boolean,
  data: Date,
  dominio: String,
  metaDados: Object,
  notaFinal: String,
  notaInicial: String,
  valores: Object,
});

MovimentoSchema.pre('save', function (next) { // eslint-disable-line
  if (typeof this.data === 'string') {
    this.data = new Date(this.data);
  }

  next();
});

const ServicoSchema = new Schema({
  conferido: Boolean,
  data: Date,
  dominio: String,
  metaDados: {
    criadoPor: String,
    dataCriacao: Date,
  },
  nota: String,
  valores: Object,
});

ServicoSchema.pre('save', function (next) { // eslint-disable-line
  if (typeof this.data === 'string') {
    this.data = new Date(this.data);
  }

  next();
});

const TotaisSchema = new Schema({
  competencia: Date,
  movimentos: Object,
  servicos: Object,
  deducoes: Object,
  adicionais: Object,
  totais: Object,
});

const AliquotasSchema = new Schema({
  ativo: Boolean,
  validade: {
    inicio: Date,
    fim: Date,
  },
  cofins: Decimal128,
  csll: Decimal128,
  formaPagamentoTrimestrais: String,
  icms: {
    aliquota: Decimal128,
    reducao: Decimal128,
  },
  irpj: Decimal128,
  iss: Decimal128,
  pis: Decimal128,
  tributacao: String,
});

const EnderecoSchema = new Schema({
  cep: String,
  complemento: String,
  estado: String,
  logradouro: String,
  municipio: {
    codigo: String,
    nome: String,
  },
  numero: String,
  pais: {
    codigo: String,
    nome: String,
  },
});

const PessoaSchema = new Schema({
  _id: String,
  nome: String,
  endereco: EnderecoSchema,
  Movimentos: [MovimentoSchema],
  Servicos: [ServicoSchema],
  Aliquotas: [AliquotasSchema],
  Totais: [TotaisSchema],
});

const Pessoa = mongoose.model('Pessoa', PessoaSchema, 'Pessoas');

module.exports = {
  Pessoa,
};
