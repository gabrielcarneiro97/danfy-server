const { PessoaPool } = require('./pools');
const { Pessoa, Endereco, Estado } = require('./models');

async function criarPessoa(pessoaParam) {
  if (pessoaParam instanceof PessoaPool) {
    return pessoaParam.save();
  }

  const pessoa = new Pessoa(pessoaParam.pessoa);
  const endereco = new Endereco(pessoaParam.endereco);
  const pessoaPool = new PessoaPool(pessoa, endereco);
  await pessoaPool.save();
  return pessoaPool;
}

async function notaPessoaToPool(cpfcnpj, pessoaObj) {
  const pessoa = new Pessoa({
    nome: pessoaObj.nome,
    cpfcnpj,
  });

  const enderecoFlat = {
    ...pessoaObj.endereco,
  };

  enderecoFlat.paisId = 1;
  delete enderecoFlat.pais;
  enderecoFlat.estadoId = await Estado.getIdBySigla(enderecoFlat.estado);
  delete enderecoFlat.estado;
  enderecoFlat.municipioId = parseInt(enderecoFlat.municipio.codigo, 10);
  delete enderecoFlat.municipio;

  const endereco = new Endereco(enderecoFlat);

  const pessoaPool = new PessoaPool(pessoa, endereco);

  await pessoaPool.save();

  return pessoaPool;
}

function pegarPessoaId(id) {
  return Pessoa.getBy({ id });
}

module.exports = {
  criarPessoa,
  pegarPessoaId,
  notaPessoaToPool,
};
