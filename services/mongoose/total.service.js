const { Pessoa } = require('../../models');

const {
  pegarMovimentosMes,
} = require('./movimento.service');

const {
  pegarNotaChave,
} = require('./nota.service');

const {
  pegarServicosMes,
} = require('./servico.service');

const {
  pegarEmpresaAliquotas,
} = require('./aliquota.service');

const {
  calculaImpostosEmpresa,
} = require('../impostos.service');


function criarTotais(cnpj, totais) {
  return new Promise((resolve, reject) => {
    Pessoa.findById(cnpj).select('Totais').then((pessoaParam) => {
      const pessoa = pessoaParam;
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
        const pessoa = pessoaParam;
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
        if (total) resolve(total._doc);
        else resolve(total);
      }).catch(err => reject(err));
  });
}

function totaisTrimestrais(cnpj, competencia, recalcular) {
  return new Promise((resolve, reject) => {
    const trimestres = {};
    trimestres['1'] = ['1'];
    trimestres['2'] = ['1', '2'];
    trimestres['3'] = ['1', '2', '3'];
    trimestres['4'] = ['4'];
    trimestres['5'] = ['4', '5'];
    trimestres['6'] = ['4', '5', '6'];
    trimestres['7'] = ['7'];
    trimestres['8'] = ['7', '8'];
    trimestres['9'] = ['7', '8', '9'];
    trimestres['10'] = ['10'];
    trimestres['11'] = ['10', '11'];
    trimestres['12'] = ['10', '11', '12'];

    const trimestre = {};

    trimestre.totais = {
      lucro: 0,
      servicos: 0,
      impostos: {
        adicionalIr: 0,
        pis: 0,
        cofins: 0,
        csll: 0,
        irpj: 0,
        iss: 0,
        gnre: 0,
        icms: {
          proprio: 0,
          difal: {
            origem: 0,
            destino: 0,
          },
        },
        total: 0,
        retencoes: {
          iss: 0,
          irpj: 0,
          csll: 0,
          pis: 0,
          cofins: 0,
          total: 0,
        },
      },
    };

    trimestres[competencia.mes].forEach((mes, id, arr) => {
      const ultimoMes = arr[arr.length - 1];
      pegarTotais(cnpj, { ano: competencia.ano, mes })
        .then((data) => {
          new Promise((resolve2) => {
            if (!data || recalcular) {
              calculaImpostosEmpresa(cnpj, {
                mes,
                ano: competencia.ano,
                mesAnterior: true,
              }).then((impostos) => {
                trimestre[mes] = impostos;
                trimestre.totais.servicos +=
                  trimestre[mes].totais.servicos;
                trimestre.totais.lucro +=
                  trimestre[mes].totais.lucro;

                trimestre.totais.impostos.irpj +=
                  trimestre[mes].totais.impostos.irpj;
                trimestre.totais.impostos.csll +=
                  trimestre[mes].totais.impostos.csll;
                trimestre.totais.impostos.iss +=
                  trimestre[mes].totais.impostos.iss;
                trimestre.totais.impostos.pis +=
                  trimestre[mes].totais.impostos.pis;
                trimestre.totais.impostos.cofins +=
                  trimestre[mes].totais.impostos.cofins;
                trimestre.totais.impostos.total +=
                  trimestre[mes].totais.impostos.total;

                trimestre.totais.impostos.icms.proprio +=
                  trimestre[mes].totais.impostos.icms.proprio;
                trimestre.totais.impostos.icms.difal.origem +=
                  trimestre[mes].totais.impostos.icms.difal.origem;
                trimestre.totais.impostos.icms.difal.destino +=
                  trimestre[mes].totais.impostos.icms.difal.destino;

                trimestre.totais.impostos.retencoes.irpj +=
                  trimestre[mes].totais.impostos.retencoes.irpj;
                trimestre.totais.impostos.retencoes.iss +=
                  trimestre[mes].totais.impostos.retencoes.iss;
                trimestre.totais.impostos.retencoes.csll +=
                  trimestre[mes].totais.impostos.retencoes.csll;
                trimestre.totais.impostos.retencoes.pis +=
                  trimestre[mes].totais.impostos.retencoes.pis;
                trimestre.totais.impostos.retencoes.cofins +=
                  trimestre[mes].totais.impostos.retencoes.cofins;
                trimestre.totais.impostos.retencoes.total +=
                  trimestre[mes].totais.impostos.retencoes.total;

                gravarTotais(cnpj, impostos, { ano: competencia.ano, mes })
                  .then(() => resolve2())
                  .catch(err => reject(err));
              }).catch(err => reject(err));
            } else {
              trimestre[mes] = data;

              trimestre.totais.servicos +=
                trimestre[mes].totais.servicos;
              trimestre.totais.lucro +=
                trimestre[mes].totais.lucro;

              trimestre.totais.impostos.irpj +=
                trimestre[mes].totais.impostos.irpj;
              trimestre.totais.impostos.csll +=
                trimestre[mes].totais.impostos.csll;
              trimestre.totais.impostos.iss +=
                trimestre[mes].totais.impostos.iss;
              trimestre.totais.impostos.pis +=
                trimestre[mes].totais.impostos.pis;
              trimestre.totais.impostos.cofins +=
                trimestre[mes].totais.impostos.cofins;
              trimestre.totais.impostos.total +=
                trimestre[mes].totais.impostos.total;

              trimestre.totais.impostos.icms.proprio +=
                trimestre[mes].totais.impostos.icms.proprio;
              trimestre.totais.impostos.icms.difal.origem +=
                trimestre[mes].totais.impostos.icms.difal.origem;
              trimestre.totais.impostos.icms.difal.destino +=
                trimestre[mes].totais.impostos.icms.difal.destino;

              trimestre.totais.impostos.retencoes.irpj +=
                trimestre[mes].totais.impostos.retencoes.irpj;
              trimestre.totais.impostos.retencoes.iss +=
                trimestre[mes].totais.impostos.retencoes.iss;
              trimestre.totais.impostos.retencoes.csll +=
                trimestre[mes].totais.impostos.retencoes.csll;
              trimestre.totais.impostos.retencoes.pis +=
                trimestre[mes].totais.impostos.retencoes.pis;
              trimestre.totais.impostos.retencoes.cofins +=
                trimestre[mes].totais.impostos.retencoes.cofins;
              trimestre.totais.impostos.retencoes.total +=
                trimestre[mes].totais.impostos.retencoes.total;
              resolve2();
            }
          }).then(() => {
            if (mes % 3 === 0) {
              let adicionalIr;
              let baseLucro;
              let baseServico;
              pegarEmpresaAliquotas(cnpj).then((aliquotas) => {
                if (aliquotas.irpj === 0.012) {
                  baseLucro = trimestre.totais.lucro * 0.08;
                } else {
                  baseLucro = trimestre.totais.lucro * 0.32;
                }
                baseServico = trimestre.totais.servicos * 0.32;

                if (baseLucro + baseServico > 60000) {
                  adicionalIr = ((baseLucro + baseServico) - 60000) * 0.1;
                } else {
                  adicionalIr = 0;
                }

                trimestre.totais.impostos.adicionalIr = adicionalIr;

                resolve(trimestre);
              }).catch(err => reject(err));
            } else if (mes === ultimoMes) {
              resolve(trimestre);
            }
          });
        })
        .catch(err => reject(err));
    });
  });
}

function pegarMovimentosServicosTotal(cnpj, mes, ano, recalcular) {
  return new Promise((resolveEnd, rejectEnd) => {
    const data = {};
    const notas = {};

    const promises = [];

    promises.push(new Promise((resolveMovs) => {
      pegarMovimentosMes(cnpj, { mes, ano }).then((movs) => {
        data.movimentos = movs;
        const movsPromises = [];
        movs.forEach((m) => {
          movsPromises.push(new Promise((resolveMov) => {
            pegarNotaChave(m.notaInicial).then((n1) => {
              pegarNotaChave(m.notaFinal).then((n2) => {
                notas[n1.chave] = n1;
                notas[n2.chave] = n2;
                data.notas = notas;
                resolveMov();
              }).catch(err => rejectEnd(err));
            }).catch(err => rejectEnd(err));
          }));
        });

        Promise.all(movsPromises).then(() => resolveMovs());
      }).catch(err => rejectEnd(err));
    }));
    promises.push(new Promise((resolveServs) => {
      pegarServicosMes(cnpj, { mes, ano }).then((servs) => {
        data.servicos = servs;
        resolveServs();
      }).catch((err) => { data.err = err; });
    }));

    Promise.all(promises).then(() => {
      totaisTrimestrais(cnpj, { mes, ano }, recalcular).then((trim) => {
        data.trimestre = trim;
        resolveEnd(data);
      }).catch(err => rejectEnd(err));
    }).catch(err => rejectEnd(err));
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
  totaisTrimestrais,
  pegarMovimentosServicosTotal,
  // excluirTotais,
};
