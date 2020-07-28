import { NotaCreateInput } from '@prisma/client';
import prisma from '..';

import NotaPessoas from '../../services/xml/notaPessoas.xml';
import { pessoaXmlToUpdateObj, pessoaXmlToCreateObj } from './pessoa';

export async function upsertNotaPessoas(notaPessoas : NotaPessoas) {
  const { nota, emitente, destinatario } = notaPessoas;

  const { informacoesEstaduais } = nota;

  const notaPlain = {
    chave: nota.chave,
    valor: parseFloat(nota.valor.total),
    textoComplementar: nota.complementar.textoComplementar,
    destinatarioContribuinte: informacoesEstaduais.destinatarioContribuinte,
    ...nota.geral,
    dataHora: new Date(nota.geral.dataHora),
  };

  delete notaPlain.naturezaOperacao;

  const res = await prisma.nota.upsert({
    update: {
      ...notaPlain,
      estadoGerador: {
        connect: {
          sigla: informacoesEstaduais.estadoGerador,
        },
      },
      estadoDestino: {
        connect: {
          sigla: informacoesEstaduais.estadoDestino,
        },
      },
      emitente: {
        update: pessoaXmlToUpdateObj(emitente),
      },
      destinatario: {
        update: pessoaXmlToUpdateObj(destinatario),
      },
    },
    create: {
      ...notaPlain,
      estadoGerador: {
        connect: {
          sigla: informacoesEstaduais.estadoGerador,
        },
      },
      estadoDestino: {
        connect: {
          sigla: informacoesEstaduais.estadoDestino,
        },
      },
      emitente: {
        create: pessoaXmlToCreateObj(emitente),
        connect: {
          cpfcnpj: emitente.cpfcnpj,
        },
      },
      destinatario: {
        create: pessoaXmlToCreateObj(destinatario),
        connect: {
          cpfcnpj: destinatario.cpfcnpj,
        },
      },
    },
    where: {
      chave: nota.chave,
    },
  });

  return res;
}

export async function criarNota(chave : string, notaParam : NotaCreateInput) {
  const nota = await prisma.nota.create({
    data: {
      chave,
      ...notaParam,
    },
  });

  return nota;
}

export async function pegarNotasEntradaEmitentePeriodo(
  cpfcnpj : string,
  periodo : { inicio : Date, fim : Date },
) {
  const [emitidas, recebidas] = await Promise.all([
    prisma.nota.findMany({
      where: {
        emitenteCpfcnpj: cpfcnpj,
        tipo: '0',
        dataHora: {
          gte: periodo.inicio,
          lte: periodo.fim,
        },
      },
      include: {
        produtos: true,
      },
    }),
    prisma.nota.findMany({
      where: {
        destinatarioCpfcnpj: cpfcnpj,
        tipo: '1',
        dataHora: {
          gte: periodo.inicio,
          lte: periodo.fim,
        },
      },
      include: {
        produtos: true,
      },
    }),
  ]);

  return [...emitidas, ...recebidas];
}
