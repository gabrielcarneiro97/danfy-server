const {
  pegarEmpresaAliquotas,
} = require('./mongoose/aliquota.service');


const {
  pegarMovimentoNotaFinal,
  pegarMovimentosMes,
} = require('./mongoose/movimento.service');

const {
  pegarServicosMes,
} = require('./mongoose/servico.service');


function calcularImpostosServico(notaServico) {
  return new Promise((resolve, reject) => {
    pegarEmpresaAliquotas(notaServico.emitente).then((aliquotas) => {
      const { valor } = notaServico;
      const { retencoes } = valor;
      const { status } = notaServico.geral;

      if (aliquotas.tributacao !== 'SN') {
        const valores = {};

        valores.servico = status === 'NORMAL' ? valor.servico : 0;

        const baseDeCalculo = status === 'NORMAL' ? valor.baseDeCalculo : 0;


        const iss = valor.iss ?
          valor.iss.valor :
          (baseDeCalculo * aliquotas.iss);
        const aliquotaIr = 0.048;
        const aliquotaCsll = 0.0288;

        valores.impostos = {
          baseDeCalculo,
          retencoes: {
            iss: status === 'NORMAL' ? retencoes.iss : 0,
            pis: status === 'NORMAL' ? retencoes.pis : 0,
            cofins: status === 'NORMAL' ? retencoes.cofins : 0,
            csll: status === 'NORMAL' ? retencoes.csll : 0,
            irpj: status === 'NORMAL' ? retencoes.irpj : 0,
            total: status === 'NORMAL' ? (parseFloat(retencoes.iss) + parseFloat(retencoes.pis) + parseFloat(retencoes.cofins) + parseFloat(retencoes.csll) + parseFloat(retencoes.irpj)) : 0,
          },
          iss: status === 'NORMAL' ? iss : 0,
          pis: (baseDeCalculo * aliquotas.pis),
          cofins: (baseDeCalculo * aliquotas.cofins),
          csll: (baseDeCalculo * aliquotaCsll),
          irpj: (baseDeCalculo * aliquotaIr),
          total: status === 'NORMAL' ? (parseFloat(iss) + (baseDeCalculo * aliquotaIr) + (baseDeCalculo * aliquotas.pis) + (baseDeCalculo * aliquotas.cofins) + (baseDeCalculo * aliquotaCsll)) : 0,
        };

        resolve(valores);
      } else {
        const valores = {};

        valores.servico = status === 'NORMAL' ? valor.servico : 0;

        const baseDeCalculo = status === 'NORMAL' ? valor.baseDeCalculo : 0;

        const aliquotaIss = valor.iss ? (valor.iss.aliquota ? parseFloat(valor.iss.aliquota) : aliquotas.iss) : aliquotas.iss; // eslint-disable-line
        const iss = valor.iss ? (valor.iss.valor ? valor.iss.valor : 0) : (baseDeCalculo * aliquotaIss); // eslint-disable-line

        valores.impostos = {
          baseDeCalculo,
          retencoes: {
            iss: status === 'NORMAL' ? retencoes.iss : 0,
            pis: status === 'NORMAL' ? retencoes.pis : 0,
            cofins: status === 'NORMAL' ? retencoes.cofins : 0,
            csll: status === 'NORMAL' ? retencoes.csll : 0,
            irpj: status === 'NORMAL' ? retencoes.irpj : 0,
            total: status === 'NORMAL' ? (parseFloat(retencoes.iss) + parseFloat(retencoes.pis) + parseFloat(retencoes.cofins) + parseFloat(retencoes.csll) + parseFloat(retencoes.irpj)) : 0,
          },
          iss: status === 'NORMAL' ? iss : 0,
          pis: 0,
          cofins: 0,
          csll: 0,
          irpj: 0,
          total: status === 'NORMAL' ? iss : 0,
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

    const { cfop: cfopFinal } = notaFinal.geral;

    if (estadoGerador !== 'MG') {
      reject(new Error(`Estado informado não suportado! Estado: ${estadoGerador}`));
    }

    if (lucro < 0 && estadoGerador !== estadoDestino) {
      lucro = 0;
    }
    if ((lucro < 0 && cfopFinal !== '1202' && cfopFinal !== '2202') || (cfopFinal === '6918' || cfopFinal === '5918') || (cfopFinal === '6913' || cfopFinal === '5913')) {
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
                origem: 0,
                destino: difal,
              },
            };

            valores.impostos.total = parseFloat(valores.impostos.total) + difal + proprio;
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
      if (cfopFinal === '1202' || cfopFinal === '2202') {
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
        Object.keys(movimentos).forEach((key) => {
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
            let pisAnterior =
              parseFloat(anterior.totais.impostos.pis) -
              parseFloat(anterior.totais.impostos.retencoes.pis);
            let cofinsAnterior =
              parseFloat(anterior.totais.impostos.cofins) -
              parseFloat(anterior.totais.impostos.retencoes.cofins);

            pisAnterior = parseFloat(pisAnterior.toFixed(1));
            cofinsAnterior = parseFloat(cofinsAnterior.toFixed(1));

            if (pisAnterior < 10 && pisAnterior > 0) {
              data.totais.impostos.acumulado.pis = pisAnterior;
            }
            if (cofinsAnterior < 10 && cofinsAnterior > 0) {
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

module.exports = {
  calcularImpostosServico,
  calcularImpostosMovimento,
  calculaImpostosEmpresa,
};
