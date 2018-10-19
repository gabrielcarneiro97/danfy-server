const { Nota, Pessoa, NotaServico } = require('../models');

function criarNota(chave, notaParam) {
  const nota = new Nota({
    _id: chave,
    ...notaParam,
  });

  return nota.save();
}

function criarNotaServico(notaServicoParam) {
  const notaServico = new NotaServico({
    ...notaServicoParam,
  });

  return notaServico.save();
}

function criarPessoa(_id, pessoaParam) {
  return Pessoa
    .findOneAndUpdate({ _id }, { _id, ...pessoaParam }, { upsert: true, runValidators: true });
}

function criarAliquota(idPessoa, aliquotasParam) {
  const aliquotas = { ...aliquotasParam };
  return new Promise((resolve, reject) => {
    Pessoa.findById(idPessoa)
      .select('Aliquotas')
      .then((doc) => {
        const pessoa = doc;

        if (pessoa.Aliquotas.length === 0) {
          aliquotas.ativo = true;
          aliquotas.validade = {};
          aliquotas.validade.inicio = new Date('01/01/1900');
          pessoa.Aliquotas.push(aliquotas);

          pessoa.save().then(() => {
            resolve();
          }).catch(err => reject(err));
        }
      }).catch(err => reject(err));
  });
}

function criarMovimento(cnpj, movimento) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Movimentos').then((pessoa) => {
      pessoa.Movimentos.push(movimento);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function criarMovimentos(cnpj, movimentos) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Movimentos').then((pessoa) => {
      pessoa.Movimentos = pessoa.Movimentos.concat(movimentos);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function criarServico(cnpj, servico) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Servicos').then((pessoa) => {
      pessoa.Servico.push(servico);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function criarServicos(cnpj, servicos) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Servicos').then((pessoa) => {
      pessoa.Servicos = pessoa.Servicos.concat(servicos);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function criarTotais(cnpj, totais) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Totais').then((pessoa) => {
      pessoa.Totais = pessoa.Totais.concat(totais);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

module.exports = {
  criarNota,
  criarPessoa,
  criarNotaServico,
  criarAliquota,
  criarMovimento,
  criarMovimentos,
  criarServico,
  criarServicos,
  criarTotais,
};
