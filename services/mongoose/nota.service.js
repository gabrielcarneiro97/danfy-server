const { ObjectId } = require('mongoose').Types;
const {
  Nota,
} = require('../../models');

function criarNota(chave, notaParam) {
  return Nota.findByIdAndUpdate(chave, {
    _id: chave,
    ...notaParam,
  }, { upsert: true, runValidators: true });
}

function criarNotaSlim(notaParam) {
  const chave = new ObjectId();
  const nota = new Nota({
    _id: chave,
    chave,
    ...notaParam,
  });

  return nota.save();
}

function pegarNotasProdutoEmitente(id, cnpj) {
  return new Promise((resolve, reject) => {
    if (id === 'INTERNO') {
      reject(new Error('Id inválido (INTERNO)'));
    } else {
      const find = `produtos.${id}`;
      Nota.find({
        emitente: cnpj,
        [find]: { $exists: true },
      }).then(docs => resolve(docs)).catch(err => reject(err));
    }
  });
}

function pegarNotaChave(chave) {
  return Nota.findById(chave);
}

module.exports = {
  criarNota,
  pegarNotasProdutoEmitente,
  pegarNotaChave,
  criarNotaSlim,
};
