const crypto = require('crypto');
const { pg } = require('../');
const { Nota, Estado, Produto } = require('./models');
const { NotaPool } = require('./pools');
const { stringToDate } = require('../calculador.service');

async function criarNota(chave, notaParam) {
  const nota = new Nota({ ...chave, notaParam });
  await nota.save();
  return nota;
}

async function criarNotaPoolSlim(valor, destinatario) {
  const nota = new Nota();
  nota.emitenteCpfcnpj = 'INTERNO';
  nota.dataHora = new Date();
  nota.cfop = 'INTERNO';
  nota.status = 'INTERNO';
  nota.tipo = 'INTERNO';
  nota.destinatarioCpfcnpj = destinatario;
  nota.valor = valor;

  let chave;
  let notasPg;

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

async function pegarNotasPoolProdutoEmitente(nome, cnpj) {
  if (nome === 'INTERNO') {
    throw new Error('Id inválido (INTERNO)');
  } else {
    const notasPg = await pg.select('nota.chave')
      .from('tb_produto as prod')
      .innerJoin('tb_nota as nota', 'prod.nota_chave', 'nota.chave')
      .where('prod.nome', nome)
      .andWhere('nota.emitente_cpfcnpj', cnpj);

    const notas = await Promise.all(notasPg.map(async (o) => NotaPool.getByChave(o.chave)));
    return notas;
  }
}

async function pegarNotaChave(chave) {
  const notaPg = await Nota.getBy({ chave });
  return new Nota(notaPg, true);
}

async function pegarNotasChaveEmitentePeriodo(emitenteCpfcnpj, periodo) {
  let notasPg;

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

async function pegarNotasPoolEmitentePeriodo(emitenteCpfcnpj, periodo) {
  const notasPg = await pegarNotasChaveEmitentePeriodo(emitenteCpfcnpj, periodo);
  return Promise.all(notasPg.map(async (o) => NotaPool.getByChave(o.chave)));
}

async function pegarNotasPoolEntradaEmitentePeriodo(cpfcnpj, periodo) {
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

async function notaXmlToPool(notaObj) {
  const notaFlat = {
    ...notaObj,
    ...notaObj.geral,
  };

  delete notaFlat.geral;

  notaFlat.emitenteCpfcnpj = notaFlat.emitente;
  notaFlat.destinatarioCpfcnpj = notaFlat.destinatario;

  delete notaFlat.emitente;
  delete notaFlat.destinatario;

  const { informacoesEstaduais } = notaFlat;
  notaFlat.estadoGeradorId = await Estado.getIdBySigla(informacoesEstaduais.estadoGerador);
  notaFlat.estadoDestinoId = await Estado.getIdBySigla(informacoesEstaduais.estadoDestino);
  notaFlat.destinatarioContribuinte = informacoesEstaduais.destinatarioContribuinte;
  delete notaFlat.informacoesEstaduais;

  notaFlat.valor = parseFloat(notaFlat.valor.total);

  const { complementar } = notaFlat;
  notaFlat.textoComplementar = complementar.textoComplementar;
  delete notaFlat.complementar;

  const produtosObj = {
    ...notaFlat.produtos,
  };

  delete notaFlat.produtos;
  delete notaFlat.produtosCodigo;

  const nota = new Nota(notaFlat);

  const produtos = [];

  Object.keys(produtosObj).forEach((nome) => {
    const prodObj = produtosObj[nome];
    const prodFlat = {
      nome,
      descricao: prodObj.descricao,
      quantidade: parseInt(prodObj.quantidade.numero, 10),
      valor: parseFloat(prodObj.valor.total),
      notaChave: nota.chave,
    };

    produtos.push(new Produto(prodFlat));
  });

  const notaPool = new NotaPool(nota, produtos);

  await notaPool.save();

  return notaPool;
}

module.exports = {
  criarNota,
  pegarNotasPoolProdutoEmitente,
  pegarNotaChave,
  criarNotaPoolSlim,
  pegarNotasPoolEmitentePeriodo,
  pegarNotasPoolEntradaEmitentePeriodo,
  notaXmlToPool,
};
