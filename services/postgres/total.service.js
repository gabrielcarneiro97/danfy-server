const { Pessoa } = require('../../models');

const {
  pegarMovimentosPoolMes,
} = require('./movimento.service');

const {
  pegarNotaChave,
} = require('./nota.service');

const {
  pegarServicosPoolMes,
} = require('./servico.service');

const {
  pegarEmpresaAliquota,
} = require('./aliquota.service');

const {
  calculaImpostosEmpresa,
} = require('../impostos.service');

const {
  TotalMovimento,
  TotalServico,
  Imposto,
  Icms,
  Retencao,
} = require('./models');
const { TotalPool, TotalMovimentoPool, TotalServicoPool } = require('./pools');


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

function pegarTotalPool(cnpj, competencia) {
  return TotalPool.getByCnpjComp(cnpj, competencia, 1);
}

function getTrimestre(mes) {
  mes = parseInt(mes, 10);
  if ((mes - 1) % 3 === 0) return [mes];
  else if ((mes - 2) % 3 === 0) return [mes - 1, mes];
  return [mes - 2, mes - 1, mes];
}

async function calcularTotalMes(cnpj, competencia) {
  const [totalMovimentoPool, totalServicoPool] = await Promise.all([
    new Promise(async (resolve) => {
      const movimentosPool = await pegarMovimentosPoolMes(cnpj, competencia);
      const totalMovimento = new TotalMovimento();
      const imposto = new Imposto();
      const icms = new Icms();

      movimentosPool.forEach(({ movimento: mov, imposto: impostoMov, icms: icmsMov }) => {
        totalMovimento.soma(mov);
        imposto.soma(impostoMov);
        icms.soma(icmsMov);
      });
      resolve(new TotalMovimentoPool(totalMovimento, imposto, icms));
    }),
    new Promise(async (resolve) => {
      const servicosPool = await pegarServicosPoolMes(cnpj, competencia);
      const totalServico = new TotalServico();
      const imposto = new Imposto();
      const retencao = new Retencao();

      servicosPool.forEach(({ servico: serv, imposto: impostoServ, retencao: retencaoServ }) => {
        totalServico.soma(serv);
        imposto.soma(impostoServ);
        retencao.soma(retencaoServ);
      });
      resolve(new TotalServicoPool(totalServico, imposto, retencao));
    }),
  ]);

  return TotalPool.newByPools(
    totalMovimentoPool,
    totalServicoPool,
    cnpj,
    new Date(competencia.ano, competencia.mes - 1),
    1,
  );
}

function totaisTrimestrais(cnpj, competencia, recalcular) {
  ret = new Promise((resolve, reject) => {

  });
  return new Promise((resolve, reject) => {
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

    getTrimestre(competencia.mes).forEach((mes, id, arr) => {
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
              pegarEmpresaAliquota(cnpj).then((aliquotas) => {
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

// pegarTotalPool('06914971000123', { mes: 1, ano: 2019 }).then(a => console.log(a));

calcularTotalMes('06914971000123', { mes: 1, ano: 2019 }).then(a => console.log(a));

module.exports = {
  criarTotais,
  gravarTotais,
  pegarTotalPool,
  totaisTrimestrais,
  pegarMovimentosServicosTotal,
};
