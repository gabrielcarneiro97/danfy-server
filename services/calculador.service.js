const {
  pegarEmpresaImpostos,
  pegarMovimentoNotaFinal,
  pegarServicosMes,
  pegarMovimentosMes,
  pegarTotais,
  gravarTotais,
} = require('./firebase.service');

function calcularImpostosServico(notaServico) {
  return new Promise((resolve, reject) => {
    pegarEmpresaImpostos(notaServico.emitente).then((aliquotas) => {
      if (aliquotas.tributacao !== 'SN') {
        const valores = {};

        valores.servico = notaServico.geral.status === 'NORMAL' ? notaServico.valor.servico : 0;

        const baseDeCalculo = notaServico.geral.status === 'NORMAL' ? notaServico.valor.baseDeCalculo : 0;

        const { retencoes } = notaServico.valor;
        const iss = notaServico.valor.iss ?
          notaServico.valor.iss.valor :
          (baseDeCalculo * aliquotas.iss);
        const aliquotaIr = 0.048;
        const aliquotaCsll = 0.0288;

        valores.impostos = {
          baseDeCalculo,
          retencoes: {
            iss: notaServico.geral.status === 'NORMAL' ? retencoes.iss : 0,
            pis: notaServico.geral.status === 'NORMAL' ? retencoes.pis : 0,
            cofins: notaServico.geral.status === 'NORMAL' ? retencoes.cofins : 0,
            csll: notaServico.geral.status === 'NORMAL' ? retencoes.csll : 0,
            irpj: notaServico.geral.status === 'NORMAL' ? retencoes.irpj : 0,
            total: notaServico.geral.status === 'NORMAL' ? (parseFloat(retencoes.iss) + parseFloat(retencoes.pis) + parseFloat(retencoes.cofins) + parseFloat(retencoes.csll) + parseFloat(retencoes.irpj)) : 0,
          },
          iss: notaServico.geral.status === 'NORMAL' ? iss : 0,
          pis: (baseDeCalculo * aliquotas.pis),
          cofins: (baseDeCalculo * aliquotas.cofins),
          csll: (baseDeCalculo * aliquotaCsll),
          irpj: (baseDeCalculo * aliquotaIr),
          total: notaServico.geral.status === 'NORMAL' ? (parseFloat(iss) + (baseDeCalculo * aliquotaIr) + (baseDeCalculo * aliquotas.pis) + (baseDeCalculo * aliquotas.cofins) + (baseDeCalculo * aliquotaCsll)) : 0,
        };

        resolve(valores);
      } else {
        const valores = {};

        valores.servico = notaServico.geral.status === 'NORMAL' ? notaServico.valor.servico : 0;

        const baseDeCalculo = notaServico.geral.status === 'NORMAL' ? notaServico.valor.baseDeCalculo : 0;

        const { retencoes } = notaServico.valor;
        const aliquotaIss = notaServico.valor.iss ? (notaServico.valor.iss.aliquota ? parseFloat(notaServico.valor.iss.aliquota) : aliquotas.iss) : aliquotas.iss; // eslint-disable-line
        const iss = notaServico.valor.iss ? (notaServico.valor.iss.valor ? notaServico.valor.iss.valor : 0) : (baseDeCalculo * aliquotaIss); // eslint-disable-line

        valores.impostos = {
          baseDeCalculo,
          retencoes: {
            iss: notaServico.geral.status === 'NORMAL' ? retencoes.iss : 0,
            pis: notaServico.geral.status === 'NORMAL' ? retencoes.pis : 0,
            cofins: notaServico.geral.status === 'NORMAL' ? retencoes.cofins : 0,
            csll: notaServico.geral.status === 'NORMAL' ? retencoes.csll : 0,
            irpj: notaServico.geral.status === 'NORMAL' ? retencoes.irpj : 0,
            total: notaServico.geral.status === 'NORMAL' ? (parseFloat(retencoes.iss) + parseFloat(retencoes.pis) + parseFloat(retencoes.cofins) + parseFloat(retencoes.csll) + parseFloat(retencoes.irpj)) : 0,
          },
          iss: notaServico.geral.status === 'NORMAL' ? iss : 0,
          pis: 0,
          cofins: 0,
          csll: 0,
          irpj: 0,
          total: notaServico.geral.status === 'NORMAL' ? iss : 0,
        };
        resolve(valores);
      }
    }).catch(err => reject(err));
  });
}

function calcularImpostosMovimento(notaInicial, notaFinal, aliquotas) {
  return new Promise((resolve, reject) => {
    let valorSaida = parseFloat(notaFinal.valor.total);
    let lucro = parseFloat(notaFinal.valor.total)
      - parseFloat(notaInicial ? notaInicial.valor.total : 0);
    const {
      estadoGerador,
      estadoDestino,
      destinatarioContribuinte,
    } = notaFinal.informacoesEstaduais;

    if (estadoGerador !== 'MG') {
      reject(new Error(`Estado informado não suportado! Estado: ${estadoGerador}`));
    }

    if (lucro < 0 && estadoGerador !== estadoDestino) {
      lucro = 0;
    }
    if ((lucro < 0 && notaFinal.geral.cfop !== '1202' && notaFinal.geral.cfop !== '2202') || (notaFinal.geral.cfop === '6918' || notaFinal.geral.cfop === '5918') || (notaFinal.geral.cfop === '6913' || notaFinal.geral.cfop === '5913')) {
      resolve({
        lucro: 0,
        valorSaida,
        impostos: {
          pis: 0,
          cofins: 0,
          csll: 0,
          irpj: 0,
          icms: {
            baseDeCalculo: 0,
            proprio: 0,
          },
          total: 0,
        },
      });
    } else {
      const proximoPasso = () => {
        const valores = {
          lucro,
          valorSaida,
          impostos: {
            pis: (lucro * aliquotas.pis),
            cofins: (lucro * aliquotas.cofins),
            csll: (lucro * aliquotas.csll),
            irpj: (lucro * aliquotas.irpj),
            icms: {
              composicaoDaBase: 0,
              difal: {
                destino: 0,
                origem: 0,
              },
              baseDeCalculo: 0,
              proprio: 0,
            },
            total: ((lucro * aliquotas.irpj)
              + (lucro * aliquotas.pis)
              + (lucro * aliquotas.cofins)
              + (lucro * aliquotas.csll)),
          },
        };

        const icmsEstados = {
          SC: {
            externo: 0.12,
            interno: 0.12,
          },
          DF: {
            externo: 0.07,
            interno: 0.12,
          },
          MS: {
            externo: 0.07,
            interno: 0.17,
          },
          MT: {
            externo: 0.07,
            interno: 0.17,
          },
          SP: {
            externo: 0.12,
            interno: 0.18,
          },
          RJ: {
            externo: 0.12,
            interno: 0.18,
          },
          GO: {
            externo: 0.07,
            interno: 0.17,
          },
          RO: {
            externo: 0.07,
            interno: 0.175,
          },
          ES: {
            externo: 0.07,
            interno: 0.12,
          },
          AC: {
            externo: 0.07,
            interno: 0.17,
          },
          CE: {
            externo: 0.07,
            interno: 0.17,
          },
          PR: {
            externo: 0.12,
            interno: 0.18,
          },
          PI: {
            externo: 0.07,
            interno: 0.17,
          },
          PE: {
            externo: 0.12,
            interno: 0.18,
          },
          MA: {
            externo: 0.07,
            interno: 0.18,
          },
          PA: {
            externo: 0.07,
            interno: 0.17,
          },
          RN: {
            externo: 0.07,
            interno: 0.18,
          },
          BA: {
            externo: 0.07,
            interno: 0.18,
          },
          RS: {
            externo: 0.12,
            interno: 0.18,
          },
          TO: {
            externo: 0.07,
            interno: 0.18,
          },
          resto: {
            extero: 0,
            interno: 0,
          },
        };

        const estadosSemReducao = ['RN', 'BA', 'RS', 'TO'];

        if (estadoGerador === estadoDestino) {
          valores.impostos.icms = {
            baseDeCalculo: (lucro * aliquotas.icms.reducao),
            proprio: (lucro * aliquotas.icms.reducao * aliquotas.icms.aliquota),
          };
          valores.impostos.total =
            (parseFloat(valores.impostos.total)
              + (lucro * aliquotas.icms.reducao
                * aliquotas.icms.aliquota));
        } else {
          if ((destinatarioContribuinte === '2' || destinatarioContribuinte === '9') && icmsEstados[estadoDestino]) { // eslint-disable-line
            const composicaoDaBase = valorSaida / (1 - icmsEstados[estadoDestino].interno);
            const baseDeCalculo = 0.05 * composicaoDaBase;
            const baseDifal =
              estadosSemReducao.includes(estadoDestino) ?
                composicaoDaBase :
                baseDeCalculo;
            const proprio = baseDifal * icmsEstados[estadoDestino].externo;
            const difal = (baseDifal * icmsEstados[estadoDestino].interno) - proprio;

            valores.impostos.icms = {
              composicaoDaBase,
              baseDeCalculo,
              proprio,
              difal: {
                origem: (difal * 0.2),
                destino: (difal * 0.8),
              },
            };

            valores.impostos.total =
              (parseFloat(valores.impostos.total) + (difal * 0.8) + (difal * 0.2) + proprio);
          } else if (destinatarioContribuinte === '1') {
            const baseDeCalculo = 0.05 * valorSaida;
            const valor = baseDeCalculo * icmsEstados[estadoDestino].externo;

            valores.impostos.icms = {
              composicaoDaBase: null,
              difal: null,
              baseDeCalculo,
              proprio: valor,
            };

            valores.impostos.total = parseFloat(valores.impostos.total) + valor;
          }
        }

        resolve(valores);
      };
      if (notaFinal.geral.cfop === '1202' || notaFinal.geral.cfop === '2202') {
        pegarMovimentoNotaFinal(notaFinal.emitente, notaInicial ? notaInicial.chave : notaInicial)
          .then((movimentoAnterior) => {
            if (movimentoAnterior) {
              lucro = (-1) * movimentoAnterior.valores.lucro;
              valorSaida = 0;
              proximoPasso();
            } else {
              valorSaida = 0;
              proximoPasso();
            }
          });
      } else {
        proximoPasso();
      }
    }
  });
}

function calculaImpostosEmpresa(empresaCnpj, competencia) {
  return new Promise((resolve, reject) => {
    const data = {
      servicos: {
        total: 0,
        impostos: {
          retencoes: {
            iss: 0,
            irpj: 0,
            csll: 0,
            pis: 0,
            cofins: 0,
            total: 0,
          },
          iss: 0,
          irpj: 0,
          csll: 0,
          pis: 0,
          cofins: 0,
          total: 0,
        },
      },
      movimentos: {
        totalSaida: 0,
        lucro: 0,
        impostos: {
          cofins: 0,
          pis: 0,
          irpj: 0,
          csll: 0,
          icms: {
            baseDeCalculo: 0,
            proprio: 0,
            difal: {
              origem: 0,
              destino: 0,
            },
          },
          total: 0,
        },
      },
      totais: {
        lucro: 0,
        servicos: 0,
        impostos: {
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
      },
    };

    pegarServicosMes(empresaCnpj, competencia).then((servicos) => {
      if (servicos) {
        Object.keys(servicos).forEach((key) => {
          const servico = servicos[key];
          data.servicos.total +=
            parseFloat(servico.valores.servico);

          data.servicos.impostos.total +=
            parseFloat(servico.valores.impostos.total);
          data.servicos.impostos.iss +=
            parseFloat(servico.valores.impostos.iss);
          data.servicos.impostos.pis +=
            parseFloat(servico.valores.impostos.pis);
          data.servicos.impostos.cofins +=
            parseFloat(servico.valores.impostos.cofins);
          data.servicos.impostos.csll +=
            parseFloat(servico.valores.impostos.csll);
          data.servicos.impostos.irpj +=
            parseFloat(servico.valores.impostos.irpj);

          data.servicos.impostos.retencoes.total +=
            parseFloat(servico.valores.impostos.retencoes.total);
          data.servicos.impostos.retencoes.iss +=
            parseFloat(servico.valores.impostos.retencoes.iss);
          data.servicos.impostos.retencoes.pis +=
            parseFloat(servico.valores.impostos.retencoes.pis);
          data.servicos.impostos.retencoes.cofins +=
            parseFloat(servico.valores.impostos.retencoes.cofins);
          data.servicos.impostos.retencoes.csll +=
            parseFloat(servico.valores.impostos.retencoes.csll);
          data.servicos.impostos.retencoes.irpj +=
            parseFloat(servico.valores.impostos.retencoes.irpj);
        });
      }
      pegarMovimentosMes(empresaCnpj, competencia).then((movimentos) => {
        console.log(Object.keys(movimentos).length);
        Object.keys(movimentos).forEach((key) => {
          console.log(key);
          const movimento = movimentos[key];
          data.movimentos.lucro +=
            parseFloat(movimento.valores.lucro);
          data.movimentos.totalSaida +=
            parseFloat(movimento.valores.valorSaida);

          data.movimentos.impostos.total +=
            parseFloat(movimento.valores.impostos.total);
          data.movimentos.impostos.pis +=
            parseFloat(movimento.valores.impostos.pis);
          data.movimentos.impostos.cofins +=
            parseFloat(movimento.valores.impostos.cofins);
          data.movimentos.impostos.csll +=
            parseFloat(movimento.valores.impostos.csll);

          data.movimentos.impostos.irpj +=
            parseFloat(movimento.valores.impostos.irpj);

          if (movimento.valores.impostos.icms) {
            data.movimentos.impostos.icms.baseDeCalculo +=
              parseFloat(movimento.valores.impostos.icms.baseDeCalculo);
            data.movimentos.impostos.icms.proprio +=
              parseFloat(movimento.valores.impostos.icms.proprio);
            if (movimento.valores.impostos.icms.difal) {
              data.movimentos.impostos.icms.difal.origem +=
                parseFloat(movimento.valores.impostos.icms.difal.origem);
              data.movimentos.impostos.icms.difal.destino +=
                parseFloat(movimento.valores.impostos.icms.difal.destino);
            }
          }
        });

        data.totais = {
          servicos: data.servicos.total,
          lucro: data.movimentos.lucro,
          impostos: {
            acumulado: {
              pis: 0,
              cofins: 0,
            },
            retencoes: data.servicos.impostos.retencoes,
            iss: data.servicos.impostos.iss,
            icms: data.movimentos.impostos.icms,
            irpj: data.movimentos.impostos.irpj + data.servicos.impostos.irpj,
            csll: data.movimentos.impostos.csll + data.servicos.impostos.csll,
            pis: data.movimentos.impostos.pis + data.servicos.impostos.pis,
            cofins: data.movimentos.impostos.cofins + data.servicos.impostos.cofins,
            total: data.movimentos.impostos.total + data.servicos.impostos.total,
          },
        };
        console.log('competencia.mesAnterior', competencia.mesAnterior);
        if (competencia.mesAnterior) {
          let anoAnterior = competencia.ano;
          let mesAnterior;
          if (parseInt(competencia.mes, 10) - 1 === 0) {
            mesAnterior = '12';
            anoAnterior = (parseInt(anoAnterior, 10) - 1).toString();
          } else {
            mesAnterior = (parseInt(competencia.mes, 10) - 1).toString();
          }
          calculaImpostosEmpresa(empresaCnpj, {
            mes: mesAnterior,
            ano: anoAnterior,
            mesAnterior: false,
          }).then((anterior) => {
            const pisAnterior =
              parseFloat(anterior.totais.impostos.pis) -
              parseFloat(anterior.totais.impostos.retencoes.pis);
            const cofinsAnterior =
              parseFloat(anterior.totais.impostos.cofins) -
              parseFloat(anterior.totais.impostos.retencoes.cofins);

            if (pisAnterior < 10) {
              data.totais.impostos.acumulado.pis = pisAnterior;
            }
            if (cofinsAnterior < 10) {
              data.totais.impostos.acumulado.cofins = cofinsAnterior;
            }

            resolve(data);
          }).catch(err => reject(err));
        } else {
          resolve(data);
        }
      }).catch(err => reject(err));
    }).catch(err => reject(err));
  });
}

function totaisTrimestrais(cnpj, competencia, recalcular) {
  return new Promise((resolve, reject) => {
    console.log('totaisTrimestrais');
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
          const checkMes = () => {
            if (mes % 3 === 0) {
              let adicionalIr;
              let baseLucro;
              let baseServico;
              pegarEmpresaImpostos(cnpj).then((aliquotas) => {
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
          };

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

              gravarTotais(impostos, cnpj, { ano: competencia.ano, mes })
                .then(() => checkMes())
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
            checkMes();
          }
        })
        .catch(err => reject(err));
    });
  });
}

const cfopCompra = ['1102', '2102'];
const cfopDevolucao = ['1202', '2202'];
const cfopDevolucaoCompra = ['5202'];
const cfopVenda = ['5102', '6102', '6108'];
const cfopConsignacao = ['1917', '2917'];
const cfopCompraConsignacao = ['1113'];
const cfopVendaConsignacao = ['5115', '6115', '5114'];
const cfopDevolucaoConsignacao = ['5918', '6918'];

function compararCFOP(notaInicial, notaFinal) {
  const cfopInicial = notaInicial.geral.cfop;
  const cfopFinal = notaFinal.geral.cfop;

  if (cfopCompra.includes(cfopInicial) && cfopVenda.includes(cfopFinal)) {
    return true;
  } else if (cfopCompraConsignacao.includes(cfopInicial) &&
    cfopVendaConsignacao.includes(cfopFinal)) {
    return true;
  } else if (cfopConsignacao.includes(cfopInicial) &&
    cfopCompraConsignacao.includes(cfopFinal)) {
    return true;
  } else if (cfopConsignacao.includes(cfopInicial) &&
    cfopDevolucaoConsignacao.includes(cfopFinal)) {
    return true;
  } else if (cfopVenda.includes(cfopInicial) &&
    cfopDevolucao.includes(cfopFinal)) {
    return true;
  } else if (cfopDevolucao.includes(cfopInicial) &&
    cfopVenda.includes(cfopFinal)) {
    return true;
  } else if (cfopCompra.includes(cfopInicial) &&
    cfopDevolucaoCompra.includes(cfopFinal)) {
    return true;
  } else if ((cfopVenda.includes(cfopInicial) &&
    cfopVenda.includes(cfopFinal)) &&
    (notaFinal.emitente !== notaInicial.emitente)) {
    return true;
  }
  return false;
}

function compararProduto(notaInicial, notaFinal) {
  let retorno = false;

  Object.keys(notaInicial.produtos).forEach((nomeProdutoInicial) => {
    Object.keys(notaFinal.produtos).forEach((nomeProdutoFinal) => {
      if (nomeProdutoFinal === nomeProdutoInicial) {
        retorno = true;
      } else if (notaInicial.produtos[nomeProdutoInicial].descricao ===
        notaFinal.produtos[nomeProdutoFinal].descricao) {
        retorno = true;
      }
    });
  });

  return retorno;
}

function compararData(notaInicial, notaFinal) {
  const dataInicial = new Date(notaInicial.geral.dataHora).getTime();
  const dataFinal = new Date(notaFinal.geral.dataHora).getTime();

  if (dataInicial <= dataFinal) {
    return true;
  }
  return false;
}

function validarMovimento(notaInicial, notaFinal) {
  if (!compararCFOP(notaInicial, notaFinal)) {
    return { isValid: false, error: new Error(`O CFOP da Nota Inicial ${notaInicial.geral.numero} ${notaInicial.geral.cfop} não é valido para o CFOP da Nota Final ${notaFinal.geral.numero} ${notaFinal.geral.cfop}`) };
  } else if (!compararProduto(notaInicial, notaFinal)) {
    return { isValid: false, error: new Error(`O produto da Nota Final ${notaFinal.geral.numero} não foi localizado na Nota Inicial ${notaInicial.geral.numero}!`) };
  } else if (!compararData(notaInicial, notaFinal)) {
    return { isValid: false, error: new Error(`A data da Nota Final ${notaFinal.geral.numero} é anterior a data da Nota Inicial ${notaInicial.geral.numero}!`) };
  }
  return { isValid: true, error: null };
}

module.exports = {
  calcularImpostosServico,
  calcularImpostosMovimento,
  totaisTrimestrais,
  validarMovimento,
};
