const { Pessoa } = require('../../models');

function criarMovimento(cnpj, movimento) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Movimentos').then((pessoa) => {
      pessoa.Movimentos.push(movimento);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function pushMovimento(cnpj, movimento) {
  return Pessoa.updateOne({ _id: cnpj }, {
    $push: { Movimentos: movimento },
  });
}

function criarMovimentos(cnpj, movimentos) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Movimentos').then((pessoaParam) => {
      const pessoa = pessoaParam;

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
        const mov = movs.find(el => el.notaFinal === chaveNota && (el.metaDados.status === 'ATIVO' || !el.metaDados));
        if (movs.length !== 0) {
          resolve(mov._doc);
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

function pegarMovimentoId(cnpj, _id) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Movimentos')
      .then(({ Movimentos: movs }) => {
        const movimentoIndex = movs.findIndex(el => el._id.toString() === _id);
        if (movimentoIndex === -1) {
          resolve({ movimento: null, movimentoIndex });
        } else {
          resolve({ movimento: movs[movimentoIndex]._doc, movimentoIndex });
        }
      }).catch(err => reject(err));
  });
}

function cancelarMovimento(cnpj, _id) {
  return new Promise((resolve, reject) => {
    pegarMovimentoId(cnpj, _id).then(({ movimento: movParam, movimentoIndex }) => {
      const movimento = movParam;
      const updateId = `Movimentos.${movimentoIndex}`;
      if (movimento.metaDados) {
        movimento.metaDados.status = 'CANCELADO';
      } else {
        movimento.metaDados = {
          criadoPor: 'DESCONHECIDO',
          dataCriacao: new Date('07/19/1997').toISOString(),
          status: 'CANCELADO',
          tipo: 'PRIM',
        };
      }
      Pessoa.updateOne({ _id: cnpj }, {
        $set: { [updateId]: movimento },
      }).then(() => resolve()).catch(err => reject(err));
    }).catch(err => reject(err));
  });
}

module.exports = {
  criarMovimento,
  pushMovimento,
  criarMovimentos,
  pegarMovimentoNotaFinal,
  pegarMovimentosMes,
  pegarMovimentoId,
  cancelarMovimento,
};
