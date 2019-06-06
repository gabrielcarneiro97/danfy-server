const { Pessoa, Endereco } = require('./models');

async function criarPessoa(dados) {
  const pessoa = new Pessoa(dados.pessoa);
  const endereco = new Endereco(dados.endereco);

  const enderecoId = await endereco.save();

  pessoa.enderecoId = enderecoId;

  return pessoa.save();
}

function pegarPessoaId(id) {
  return Pessoa.getBy({ id });
}

module.exports = {
  criarPessoa,
  pegarPessoaId,
};
