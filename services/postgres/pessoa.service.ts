import PessoaPool from './pools/pessoa.pool';

import Pessoa from './models/pessoa.model';
import Endereco from './models/endereco.model';
import Estado from './models/estado.model';

export async function criarPessoa(pessoaParam : PessoaPool |
  { endereco : object, pessoa : object }) {
  if (pessoaParam instanceof PessoaPool) {
    await pessoaParam.save();
    return pessoaParam;
  }

  const pessoa = new Pessoa(pessoaParam.pessoa);
  const endereco = new Endereco(pessoaParam.endereco);
  const pessoaPool = new PessoaPool(pessoa, endereco);
  await pessoaPool.save();
  return pessoaPool;
}

export async function notaPessoaToPool(cpfcnpj : string, pessoaObj :
  { nome : string, endereco : any }) {
  const [pessoaPg] = await Pessoa.getBy('cpfcnpj', cpfcnpj);
  const pessoa = pessoaPg || new Pessoa({
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

  try {
    await pessoaPool.save();
  } catch (err) {
    console.log('pessoa já no db');
  }

  return pessoaPool;
}

export async function pegarPessoaId(cpfcnpj : string) {
  const [pessoa] = await Pessoa.getBy({ cpfcnpj });
  return pessoa;
}
