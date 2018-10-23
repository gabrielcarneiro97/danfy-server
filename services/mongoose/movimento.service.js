const { Pessoa } = require('../../models');

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
    Pessoa.findById(cnpj).select('Movimentos').then((pessoaParam) => {
      const pessoa = { ...pessoaParam };

      pessoa.Movimentos = pessoa.Movimentos.concat(movimentos);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function pegarMovimentoNotaFinal(cnpj, chaveNota) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Movimentos -_id')
      .then(({ Movimentos: movs }) => {
        const mov = movs.find(el => el.notaFinal === chaveNota && el.metaDados.status === 'ATIVO');
        if (movs.length !== 0) {
          resolve(mov);
        } else {
          reject(new Error('Mais de um documento ativo com a chave informada!'));
        }
      })
      .catch(err => reject(err));
  });
}

function pegarMovimentosMes(cnpj, competencia) {
  const mes = parseInt(competencia.mes, 10);
  const ano = parseInt(competencia.ano, 10);
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Movimentos -_id')
      .then(({ Movimentos: todosMovs }) => {
        const movs = todosMovs.filter((el) => {
          const movMes = el.data.getMonth() + 1;
          const movAno = el.data.getFullYear();
          return mes === movMes && ano === movAno;
        });
        resolve(movs);
      }).catch(err => reject(err));
  });
}

module.exports = {
  criarMovimento,
  criarMovimentos,
  pegarMovimentoNotaFinal,
  pegarMovimentosMes,
};
