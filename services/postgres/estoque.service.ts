import ProdutoEstoque from './models/produtoEstoque.model';

import { stringToDate } from '../calculador.service';

import { pegarNotasPoolEntradaEmitentePeriodo } from './nota.service';
import { pegarMovimentoPoolNotaInicial } from './movimento.service';

import NotaPool from './pools/nota.pool'; // eslint-disable-line no-unused-vars
import MovimentoPool from './pools/movimento.pool'; // eslint-disable-line no-unused-vars

export function periodoAte(data : string) {
  const fim = stringToDate(data);
  const inicio = stringToDate('01-01-1900');
  const periodo = { inicio, fim };
  return periodo;
}

export async function pegarEstoque(cpfcnpj : string, data : string) {
  return ProdutoEstoque.getByDonoAte(cpfcnpj, data);
}

export async function inserirProduto(produto : ProdutoEstoque | object) {
  if (produto instanceof ProdutoEstoque) {
    await produto.save();
    return produto;
  }
  const pEModel = new ProdutoEstoque(produto);
  await pEModel.save();
  const [produtoEstoque] = await ProdutoEstoque.getBy('id', pEModel.id.toString());

  return produtoEstoque;
}

async function novoProdutoEstoquePorNota(notaInicialPool : NotaPool, cpfcnpj : string) {
  const notaInicialChave = notaInicialPool.nota.chave;
  const movimentoPool = await pegarMovimentoPoolNotaInicial(notaInicialChave);
  const [produto] = notaInicialPool.produtos;

  const produtoEstoque = {
    dataEntrada: notaInicialPool.nota.dataHora,
    dataSaida: null,
    notaFinalChave: null,
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

export async function atualizarSaidaProduto(produtoEstoque : ProdutoEstoque,
  movimentoPool : MovimentoPool) {
  produtoEstoque.dataSaida = movimentoPool.movimento.dataHora; // eslint-disable-line
  produtoEstoque.notaFinalChave = movimentoPool.movimento.notaFinalChave; // eslint-disable-line

  return inserirProduto(produtoEstoque);
}

export async function atualizarEstoque(cpfcnpj : string, data : string) {
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
