const { PessoaPool } = require('./pools');
const { Pessoa, Endereco } = require('./models');

async function criarPessoa(pessoaPool) {
  if (pessoaPool instanceof PessoaPool) {
    return pessoaPool.save();
  }

  const pessoa = new Pessoa(pessoaPool.pessoa);
  const endereco = new Endereco(pessoaPool.endereco);

  return new PessoaPool(pessoa, endereco).save();
}

function pegarPessoaId(id) {
  return Pessoa.getBy({ id });
}

module.exports = {
  criarPessoa,
  pegarPessoaId,
};
