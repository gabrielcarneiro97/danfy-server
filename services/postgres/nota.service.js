const crypto = require('crypto');
const { pg } = require('../');

async function criarNota(chave, notaParam) {
  return new Promise((resolve, reject) => {
    pg.from('tb_nota').where({
      chave,
    }).then(([notaPg]) => {
      if (notaPg) {
        pg.table('tb_nota')
          .where({ chave })
          .update(notaParam)
          .then(resolve)
          .catch(reject);
      } else {
        pg.table('tb_nota')
          .insert({
            chave,
            ...notaParam,
          })
          .then(resolve)
          .catch(reject);
      }
    }).catch(reject);
  });
}

async function criarNotaSlim(notaParam) {
  let chave;
  let notasPg;

  /* eslint-disable no-await-in-loop */
  do {
    chave = crypto.randomBytes(20).toString('hex');
    notasPg = await pg.from('tb_nota').where({ chave });
  } while (notasPg.length !== 0);

  return pg.table('tb_nota').insert({
    ...notaParam,
    chave,
  });
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
        .then(resolve)
        .catch(reject);
    }
  });
}

function pegarNotaChave(chave) {
  return new Promise((resolve, reject) => {
    pg.from('tb_nota')
      .where({ chave })
      .then(([notaPg]) => resolve(notaPg))
      .catch(reject);
  });
}

module.exports = {
  criarNota,
  pegarNotasProdutoEmitente,
  pegarNotaChave,
  criarNotaSlim,
};
