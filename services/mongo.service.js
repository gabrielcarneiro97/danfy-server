const { Nota } = require('../models/nota.model');
const { Pessoa } = require('../models/pessoa.model');

function criarNota(chave, notaParam) {
  const nota = new Nota({
    _id: chave,
    ...notaParam,
  });

  return nota.save();
}

function criarPessoa(_id, pessoaParam) {
  const pessoa = new Pessoa({
    _id,
    ...pessoaParam,
  });

  return pessoa.save();
}

module.exports = {
  criarNota,
  criarPessoa,
};
