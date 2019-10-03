const ProdutoEstoqueModel = require('./models/produtoEstoque.model');
const { stringToDate } = require('../calculador.service');
const { pegarNotasPoolEntradaEmitentePeriodo } = require('./nota.service');

function periodoAte(data) {
  const fim = stringToDate(data);
  const inicio = stringToDate('01-01-1900');
  const periodo = { inicio, fim };
  return periodo;
}

async function pegarEstoque(cpfcnpj, data) {
  return ProdutoEstoqueModel.getByDonoAte(cpfcnpj, data);
}

async function atualizarEstoque(cpfcnpj, data) {
  const periodo = periodoAte(data);
  const estoqueAtual = pegarEstoque(cpfcnpj, data);
  const notasPoolEntrada = await pegarNotasPoolEntradaEmitentePeriodo(cpfcnpj, periodo);
}


module.exports = {
  atualizarEstoque,
};
