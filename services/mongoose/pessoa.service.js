const { Pessoa } = require('../../models');

function criarPessoa(_id, pessoaParam) {
  return Pessoa
    .findByIdAndUpdate(_id, { _id, ...pessoaParam }, { upsert: true, runValidators: true });
}

function pegarPessoaFlat(_id) {
  return Pessoa.findById(_id).select('-Movimentos -Servicos -Aliquotas -Totais');
}

module.exports = {
  criarPessoa,
  pegarPessoaFlat,
};
