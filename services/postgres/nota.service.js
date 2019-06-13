const crypto = require('crypto');
const { pg } = require('../');
const { Nota, Estado, Produto } = require('./models');
const { NotaPool } = require('./pools');

async function criarNota(chave, notaParam) {
  const nota = new Nota({ ...chave, notaParam });
  return nota.save();
}

async function criarNotaSlim(notaParam) {
  let chave;
  let notasPg;

  /* eslint-disable no-await-in-loop */
  do {
    chave = crypto.randomBytes(20).toString('hex');
    notasPg = await Nota.getBy({ chave });
  } while (notasPg.length !== 0);

  return criarNota(chave, notaParam);
}

function pegarNotasProdutoEmitente(nome, cnpj) {
  return new Promise((resolve, reject) => {
    if (nome === 'INTERNO') {
      reject(new Error('Id inválido (INTERNO)'));
    } else {
      pg.select('nota.*')
        .from('tb_produto as prod')
        .innerJoin('tb_nota as nota', 'prod.nota_chave', 'nota.chave')
        .where('prod.nome', nome)
        .andWhere('nota.emitente_cpfcnpj', cnpj)
        .then(notasPg => resolve(notasPg.map(o => new Nota(o, true))))
        .catch(reject);
    }
  });
}

function pegarNotaChave(chave) {
  return new Promise((resolve, reject) => {
    Nota.getBy({ chave })
      .then(([nota]) => resolve(nota))
      .catch(reject);
  });
}

async function notaToPool(notaObj) {
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
  pegarNotasProdutoEmitente,
  pegarNotaChave,
  criarNotaSlim,
  notaToPool,
};
