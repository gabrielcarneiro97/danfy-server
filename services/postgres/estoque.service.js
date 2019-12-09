const ProdutoEstoqueModel = require('./models/produtoEstoque.model');
const { stringToDate } = require('../calculador.service');
const { pegarNotasPoolEntradaEmitentePeriodo } = require('./nota.service');
const { pegarMovimentoPoolNotaInicial } = require('./movimento.service');

function periodoAte(data) {
  const fim = stringToDate(data);
  const inicio = stringToDate('01-01-1900');
  const periodo = { inicio, fim };
  return periodo;
}

async function pegarEstoque(cpfcnpj, data) {
  return ProdutoEstoqueModel.getByDonoAte(cpfcnpj, data);
}

async function inserirProduto(produto) {
  if (produto instanceof ProdutoEstoqueModel) {
    await produto.save();
    return produto;
  }
  const pEModel = new ProdutoEstoqueModel(produto);
  await pEModel.save();
  return (await ProdutoEstoqueModel.getBy('id', pEModel.id))[0];
}

async function novoProdutoEstoquePorNota(notaInicialPool, cpfcnpj) {
  const notaInicialChave = notaInicialPool.nota.chave;
  const movimentoPool = await pegarMovimentoPoolNotaInicial(notaInicialChave);
  const [produto] = notaInicialPool.produtos;

  const produtoEstoque = {
    dataEntrada: notaInicialPool.nota.dataHora,
    donoCpfcnpj: cpfcnpj,
    valorEntrada: notaInicialPool.nota.valor,
    notaInicialChave,
    ativo: true,
    produtoCodigo: produto.nome,
    descricao: produto.descricao,
  };

  if (movimentoPool) {
    produtoEstoque.dataSaida = movimentoPool.movimento.dataHora;
    produtoEstoque.notaFinalChave = movimentoPool.movimento.notaFinalChave;
  }

  return inserirProduto(produtoEstoque);
}

async function atualizarSaidaProduto(produtoEstoque, movimentoPool) {
  produtoEstoque.dataSaida = movimentoPool.movimento.dataHora; // eslint-disable-line
  produtoEstoque.notaFinalChave = movimentoPool.movimento.notaFinalChave; // eslint-disable-line

  return inserirProduto(produtoEstoque);
}

async function atualizarEstoque(cpfcnpj, data) {
  const periodo = data && periodoAte(data);
  const [estoqueAtual, notasPoolEntrada] = await Promise.all([
    pegarEstoque(cpfcnpj, data),
    pegarNotasPoolEntradaEmitentePeriodo(cpfcnpj, periodo),
  ]);

  const estoqueAtualSemSaida = estoqueAtual.filter(({ dataSaida }) => dataSaida === null);
  const produtosAtualizados = (await Promise.all(
    estoqueAtualSemSaida.map(async (produtoEstoque) => {
      const { notaInicialChave } = produtoEstoque;
      const movimentoPool = await pegarMovimentoPoolNotaInicial(notaInicialChave);
      if (!movimentoPool) return null;
      return atualizarSaidaProduto(produtoEstoque, movimentoPool);
    }),
  )).filter((prod) => prod !== null);
  const notasInicialChave = notasPoolEntrada
    .filter(({ nota }) => !estoqueAtual
      .find(({ notaInicialChave }) => nota.chave === notaInicialChave))
    .map(({ nota }) => nota.chave);

  const produtosNovos = await Promise.all(notasInicialChave.map(
    async (notaInicialChave) => {
      const notaInicialPool = notasPoolEntrada.find(({ nota }) => nota.chave === notaInicialChave);
      return novoProdutoEstoquePorNota(notaInicialPool, cpfcnpj);
    },
  ));

  const estoqueAtualizado = await pegarEstoque(cpfcnpj, data);

  return {
    produtosNovos,
    produtosAtualizados,
    estoqueAtualizado,
  };
}

module.exports = {
  atualizarEstoque,
  pegarEstoque,
  inserirProduto,
};
