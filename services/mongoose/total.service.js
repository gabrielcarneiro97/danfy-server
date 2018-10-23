const { Pessoa } = require('../../models');


function criarTotais(cnpj, totais) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Totais').then((pessoaParam) => {
      const pessoa = { ...pessoaParam };
      pessoa.Totais = pessoa.Totais.concat(totais);
      pessoa.save().then(() => resolve()).catch(err => reject(err));
    });
  });
}

function gravarTotais(cnpj, dados, compObj) {
  const mes = parseInt(compObj.mes, 10) - 1;
  const ano = parseInt(compObj.ano, 10);

  const competencia = new Date(ano, mes, 1);

  const totais = { ...dados, competencia };

  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Totais')
      .then((pessoaParam) => {
        const pessoa = { ...pessoaParam };
        const totaisArray = pessoa.Totais;

        const checkComp = totaisArray.findIndex((el) => {
          const elComp = el.competencia;
          const elMes = elComp.getMonth();
          const elAno = elComp.getFullYear();

          return mes === elMes && ano === elAno;
        });

        if (checkComp !== -1) {
          pessoa.Totais[checkComp] = totais;
        } else {
          pessoa.Totais.push(totais);
        }


        pessoa.save().then(() => resolve()).catch(err => reject(err));
      }).catch(err => reject(err));
  });
}

function pegarTotais(cnpj, competencia) {
  const mes = parseInt(competencia.mes, 10);
  const ano = parseInt(competencia.ano, 10);
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj)
      .select('Totais -_id')
      .then(({ Totais: totais }) => {
        const total = totais.find((el) => {
          const totMes = el.competencia.getMonth() + 1;
          const totAno = el.competencia.getFullYear();
          return mes === totMes && ano === totAno;
        });
        resolve(total);
      }).catch(err => reject(err));
  });
}

// function excluirTotais() {
//   Pessoa
//     .updateMany({ Totais: { $exists: true } }, { $unset: { Totais: 1 } })
//     .then(a => console.log(a)).catch(err => console.error(err));
// }

module.exports = {
  criarTotais,
  gravarTotais,
  pegarTotais,
  // excluirTotais,
};
