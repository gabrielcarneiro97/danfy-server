const crypto = require('crypto');
const { pg } = require('../');
const Nota = require('./models');

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

module.exports = {
  criarNota,
  pegarNotasProdutoEmitente,
  pegarNotaChave,
  criarNotaSlim,
};
