import * as crypto from 'crypto';

import { pg } from '../pg.service';
import {
  stringToDate,
  Periodo, // eslint-disable-line no-unused-vars
} from '../calculador.service';

import NotaPool from './pools/nota.pool';

import Nota from './models/nota.model';
import Estado from './models/estado.model';
import Produto from './models/produto.model';

import NotaXml from '../xml/nota.xml'; // eslint-disable-line no-unused-vars

export async function criarNota(chave : string, notaParam : object) {
  const nota = new Nota({ chave, ...notaParam });
  await nota.save();
  return nota;
}

export async function criarNotaPoolSlim(valor : number, destinatario : string) {
  const nota = new Nota(null);
  nota.emitenteCpfcnpj = 'INTERNO';
  nota.dataHora = new Date();
  nota.cfop = 'INTERNO';
  nota.status = 'INTERNO';
  nota.tipo = 'INTERNO';
  nota.destinatarioCpfcnpj = destinatario;
  nota.valor = valor;

  let chave : string;
  let notasPg : Nota[];

  /* eslint-disable no-await-in-loop */
  do {
    chave = crypto.randomBytes(20).toString('hex');
    notasPg = await Nota.getBy({ chave });
  } while (notasPg.length !== 0);

  nota.chave = chave;

  const notaPool = new NotaPool(nota);

  await notaPool.save();

  return notaPool;
}

export async function pegarNotasPoolProdutoEmitente(nome : string, cnpj : string) {
  if (nome === 'INTERNO') {
    throw new Error('Id inválido (INTERNO)');
  } else {
    const notasPg = await pg.select('nota.chave')
      .from('tb_produto as prod')
      .innerJoin('tb_nota as nota', 'prod.nota_chave', 'nota.chave')
      .where('prod.nome', nome)
      .andWhere('nota.emitente_cpfcnpj', cnpj);

    const notas : NotaPool[] = await Promise.all(
      notasPg.map(async (o) => NotaPool.getByChave(o.chave)),
    );
    return notas;
  }
}

export async function pegarNotaChave(chave : string) {
  const notaPg = await Nota.getBy({ chave });
  return new Nota(notaPg, true);
}

export async function pegarNotasChaveEmitentePeriodo(emitenteCpfcnpj : string, periodo : Periodo) {
  let notasPg : Nota[];

  if (!periodo) {
    notasPg = await pg.select('nota.chave')
      .from('tb_nota as nota')
      .where('nota.emitente_cpfcnpj', emitenteCpfcnpj);
  } else {
    const { inicio: inicioString, fim: fimString } = periodo;

    const inicio = stringToDate(inicioString);
    const fim = stringToDate(fimString);

    notasPg = await pg.select('nota.chave')
      .from('tb_nota as nota')
      .where('nota.emitente_cpfcnpj', emitenteCpfcnpj)
      .andWhere('mov.data_hora', '<=', fim)
      .andWhere('mov.data_hora', '>=', inicio);
  }

  return notasPg;
}

export async function pegarNotasPoolEmitentePeriodo(emitenteCpfcnpj : string, periodo : Periodo) {
  const notasPg = await pegarNotasChaveEmitentePeriodo(emitenteCpfcnpj, periodo);
  return Promise.all(notasPg.map(async (o) => NotaPool.getByChave(o.chave)));
}

export async function pegarNotasPoolEntradaEmitentePeriodo(cpfcnpj : string,
  periodo : Periodo) : Promise<NotaPool[]> {
  let notasPg;

  if (!periodo) {
    notasPg = await Promise.all([
      pg.select('nota.chave')
        .from('tb_nota as nota')
        .where('nota.emitente_cpfcnpj', cpfcnpj)
        .andWhere('nota.tipo', '0'),
      pg.select('nota.chave')
        .from('tb_nota as nota')
        .where('nota.destinatario_cpfcnpj', cpfcnpj)
        .andWhere('nota.tipo', '1'),
    ]);
  } else {
    const { inicio, fim } = periodo;

    notasPg = await Promise.all([
      pg.select('nota.chave')
        .from('tb_nota as nota')
        .where('nota.emitente_cpfcnpj', cpfcnpj)
        .andWhere('nota.tipo', '0')
        .andWhere('nota.data_hora', '<=', fim)
        .andWhere('nota.data_hora', '>=', inicio),
      pg.select('nota.chave')
        .from('tb_nota as nota')
        .where('nota.destinatario_cpfcnpj', cpfcnpj)
        .andWhere('nota.tipo', '1')
        .andWhere('nota.data_hora', '<=', fim)
        .andWhere('nota.data_hora', '>=', inicio),
    ]);
  }

  return Promise.all(notasPg.flat().map(async (o) => NotaPool.getByChave(o.chave)));
}

export async function notaXmlToPool(notaObj : NotaXml) {
  const notaFlat = {
    ...notaObj,
    ...notaObj.geral,
  };

  const nota = new Nota(null);

  nota.chave = notaFlat.chave;
  nota.numero = notaFlat.numero;
  nota.emitenteCpfcnpj = notaFlat.emitente;
  nota.destinatarioCpfcnpj = notaFlat.destinatario;
  nota.cfop = notaFlat.cfop;
  nota.dataHora = new Date(notaFlat.dataHora);
  nota.status = notaFlat.status;
  nota.tipo = notaFlat.tipo;

  const { informacoesEstaduais } = notaFlat;
  nota.estadoGeradorId = await Estado.getIdBySigla(informacoesEstaduais.estadoGerador);
  nota.estadoDestinoId = await Estado.getIdBySigla(informacoesEstaduais.estadoDestino);
  nota.destinatarioContribuinte = informacoesEstaduais.destinatarioContribuinte;

  nota.valor = parseFloat(notaFlat.valor.total);

  const { complementar } = notaFlat;
  nota.textoComplementar = complementar.textoComplementar;


  const produtosObj = {
    ...notaFlat.produtos,
  };

  const produtos = Object.keys(produtosObj).map((nome) => {
    const prodObj = produtosObj[nome];
    const prodFlat = {
      nome,
      descricao: prodObj.descricao,
      quantidade: parseInt(prodObj.quantidade.numero, 10),
      valor: parseFloat(prodObj.valor.total),
      notaChave: nota.chave,
    };

    return new Produto(prodFlat);
  });

  const notaPool = new NotaPool(nota, produtos);

  await notaPool.save();

  console.log(notaPool);

  return notaPool;
}
