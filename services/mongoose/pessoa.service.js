const { Pessoa } = require('../../models');

function criarPessoa(_id, pessoaParam) {
  return Pessoa
    .findByIdAndUpdate(_id, { _id, ...pessoaParam }, { upsert: true, runValidators: true });
}

module.exports = {
  criarPessoa,
};
