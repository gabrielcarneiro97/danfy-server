import {
  PrismaClient, ProdutoEstoqueCreateInput, Nota, Movimento, ProdutoEstoque,
} from '@prisma/client';
import { stringToDate } from '../../services/date';
import { pegarNotasEntradaEmitentePeriodo } from './nota';

export function periodoAte(data : string) {
  const fim = stringToDate(data);
  const inicio = new Date(0);
  return { inicio, fim };
}

export async function pegarEstoque(cpfcnpj : string, data : string) {
  const prisma = new PrismaClient();

  const estoque = await prisma.produtoEstoque.findMany({
    where: {
      donoCpfcnpj: cpfcnpj,
      dataEntrada: {
        lte: stringToDate(data),
      },
    },
  });

  prisma.disconnect();

  return estoque;
}

export async function inserirProduto(produto : ProdutoEstoqueCreateInput | ProdutoEstoque) {
  const prisma = new PrismaClient();

  const produtoDb = await prisma.produtoEstoque.create({
    data: produto,
  });

  prisma.disconnect();

  return produtoDb;
}

export async function novoProdutoEstoquePorNota(notaInicial : Nota, cpfcnpj : string) {
  const prisma = new PrismaClient();

  const [movimento] = await prisma.movimento.findMany({
    where: {
      notaInicialChave: notaInicial.chave,
    },
  });

  const [produto] = await prisma.produto.findMany({
    where: {
      notaChave: notaInicial.chave,
    },
  });

  const produtoEstoque = {
    dataEntrada: notaInicial.dataHora,
    dataSaida: movimento?.dataHora,
    notaFinalChave: movimento?.notaFinalChave,
    donoCpfcnpj: cpfcnpj,
    valorEntrada: notaInicial.valor,
    notaInicialChave: notaInicial.chave,
    ativo: true,
    produtoCodigo: produto?.nome,
    descricao: produto?.descricao,
  };

  prisma.disconnect();

  return inserirProduto(produtoEstoque);
}

export async function atualizarSaidaProduto(
  produtoEstoque : ProdutoEstoque, movimento : Movimento,
) {
  return inserirProduto({
    ...produtoEstoque,
    dataSaida: movimento.dataHora,
    notaFinalChave: movimento.notaFinalChave,
  });
}

export async function atualizarEstoque(cpfcnpj : string, data : string) {
  const prisma = new PrismaClient();

  const periodo = periodoAte(data);

  const [estoqueAtual, notasEntrada] = await Promise.all([
    pegarEstoque(cpfcnpj, data),
    pegarNotasEntradaEmitentePeriodo(cpfcnpj, periodo),
  ]);

  const estoqueAtualSemSaida = estoqueAtual.filter(({ dataSaida }) => dataSaida === null);

  const produtosAtualizados = (await Promise.all(
    estoqueAtualSemSaida.map(async (produtoEstoque) => {
      const { notaInicialChave } = produtoEstoque;
      const [movimento] = await prisma.movimento.findMany({
        where: {
          notaInicialChave,
        },
      });

      if (!movimento) return null;

      return atualizarSaidaProduto(produtoEstoque, movimento);
    }),
  )).filter((produto) => produto !== null);

  const notasIniciais = notasEntrada.filter(
    (nota) => !estoqueAtual.find(({ notaInicialChave }) => nota.chave === notaInicialChave),
  );

  const produtosNovos = await Promise.all(notasIniciais.map(
    async (nota) => novoProdutoEstoquePorNota(nota, cpfcnpj),
  ));

  const estoqueAtualizado = await pegarEstoque(cpfcnpj, data);

  prisma.disconnect();

  return {
    produtosNovos,
    produtosAtualizados,
    estoqueAtualizado,
  };
}
