const { Pessoa } = require('../../models');

function criarServico(cnpj, servico) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Servicos').then((pessoa) => {
      pessoa.Servico.push(servico);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function pushServico(cnpj, servico) {
  return Pessoa.updateOne({ _id: cnpj }, {
    $push: { Servico: servico },
  });
}

function criarServicos(cnpj, servicos) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Servicos').then((pessoaParam) => {
      const pessoa = { ...pessoaParam };
      pessoa.Servicos = pessoa.Servicos.concat(servicos);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function pegarServicosMes(cnpj, competencia) {
  const mes = parseInt(competencia.mes, 10);
  const ano = parseInt(competencia.ano, 10);
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Servicos -_id')
      .then(({ Servicos: todosSrvs }) => {
        const servicos = todosSrvs.filter((el) => {
          const srvMes = el.data.getMonth() + 1;
          const srvAno = el.data.getFullYear();
          return mes === srvMes && ano === srvAno;
        });
        resolve(servicos);
      }).catch(err => reject(err));
  });
}

function pegarServico(cnpj, servicoId) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Servicos -_id')
      .then(({ Servicos: todosSrvs }) => {
        const servico = todosSrvs.find(srv => srv.chave === servicoId);
        resolve(servico);
      }).catch(err => reject(err));
  });
}

module.exports = {
  criarServico,
  pushServico,
  criarServicos,
  pegarServicosMes,
  pegarServico,
};
