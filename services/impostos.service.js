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


const {
  pg,
  cfopDevolucao,
  cfopDevolucaoConsignacao,
  cfopDevolucaoDemonstracao,
} = require('.');

const impostosFederais = ['pis', 'cofins', 'csll', 'irpj'];


function pegarServicosMesPg(cnpj, competencia) {
  return new Promise((resolve, reject) => {
    const mes = {
      inicio: new Date(competencia.ano, competencia.mes - 1),
      fim: new Date(new Date(competencia.ano, competencia.mes) - 1),
    };
    const servicos = [];
    pg.select([
      'serv.dono_cpfcnpj',
      'serv.nota_chave',
      'serv.valor',
      'serv.id',
      'imp.iss as imp_iss',
      'imp.pis as imp_pis',
      'imp.cofins as imp_cofins',
      'imp.irpj as imp_irpj',
      'imp.csll as imp_csll',
      'imp.total as imp_total',
      'imp.id as imp_id',
      'ret.iss as ret_iss',
      'ret.pis as ret_pis',
      'ret.cofins as ret_cofins',
      'ret.irpj as ret_irpj',
      'ret.csll as ret_csll',
      'ret.inss as ret_inss',
      'ret.total as ret_total',
      'ret.id as ret_id',
      'nota.emitente_cpfcnpj as nota_emitente_cpfcnpj',
      'nota.destinatario_cpfcnpj as nota_destinatario_cpfcnpj',
      'nota.numero as nota_numero',
      'nota.valor as nota_valor',
      'nota.data_hora as nota_data_hora',
      'nota.status as nota_status',
    ])
      .from('tb_servico as serv')
      .innerJoin('tb_imposto as imp', 'serv.imposto_id', 'imp.id')
      .innerJoin('tb_retencao as ret', 'serv.retencao_id', 'ret.id')
      .innerJoin('tb_nota_servico as nota', 'serv.nota_chave', 'nota.chave')
      .where('serv.dono_cpfcnpj', cnpj)
      .andWhere('serv.data_hora', '<=', mes.fim)
      .andWhere('serv.data_hora', '>=', mes.inicio)
      .then((servsPg) => {
        servsPg.forEach((servPg) => {
          const servico = {
            imposto: {},
            retencao: {},
            nota: {},
          };

          Object.keys(servPg).forEach((key) => {
            if (key.startsWith('imp_')) {
              servico.imposto[key.replace('imp_', '')] = servPg[key];
            } else if (key.startsWith('ret_')) {
              servico.retencao[key.replace('ret_', '')] = servPg[key];
            } else if (key.startsWith('nota_')) {
              servico.nota[key.replace('nota_', '')] = servPg[key];
            } else {
              servico[key] = servPg[key];
            }
          });

          servicos.push(servico);
        });
        resolve(servicos);
      })
      .catch(e => reject(e));
  });
}

function pegarMovimentosMesPg(cnpj, competencia) {
  return new Promise((resolve, reject) => {
    const mes = {
      inicio: new Date(competencia.ano, competencia.mes - 1),
      fim: new Date(new Date(competencia.ano, competencia.mes) - 1),
    };

    pg.select([
      'mov.id',
      'mov.dono_cpfcnpj',
      'mov.nota_final_chave',
      'mov.nota_inicial_chave',
      'mov.valor_saida',
      'mov.lucro',
      'mov.data_hora',
      'mov.conferido',
      'md.md_id as md_id',
      'md.ativo as md_ativo',
      'md.email as md_email',
      'md.md_data_hora as md_data_hora',
      'md.tipo as md_tipo',
      'md.ref_movimento_id as md_ref_movimento_id',
      'imp.cofins as imp_cofins',
      'imp.csll as imp_csll',
      'imp.irpj as imp_irpj',
      'imp.pis as imp_pis',
      'imp.total as imp_total',
      'icms.base_calculo as icms_base_calculo',
      'icms.composicao_base as icms_composicao_base',
      'icms.difal_destino as icms_difal_destino',
      'icms.difal_origem as icms_difal_origem',
      'icms.proprio as icms_proprio',
      'inicial.valor as incial_valor',
      'final.valor as final_valor',
    ])
      .from('tb_movimento as mov')
      .innerJoin('tb_imposto as imp', 'mov.imposto_id', 'imp.id')
      .innerJoin('tb_icms as icms', 'imp.icms_id', 'icms.id')
      .innerJoin('tb_meta_dados as md', 'mov.meta_dados_id', 'md.md_id')
      .innerJoin('tb_nota as inicial', 'mov.nota_inicial_chave', 'inicial.chave')
      .innerJoin('tb_nota as final', 'mov.nota_final_chave', 'final.chave')
      .where('mov.dono_cpfcnpj', cnpj)
      .andWhere('md.ativo', true)
      .andWhere('mov.data_hora', '<=', mes.fim)
      .andWhere('mov.data_hora', '>=', mes.inicio)
      .then((movsPg) => {
        const movimentos = [];
        movsPg.forEach((movPg) => {
          const movimento = {
            imposto: {
              icms: {},
            },
            meta_dados: {},
          };

          Object.keys(movPg).forEach((key) => {
            if (key.startsWith('md_')) movimento.meta_dados[key.replace('md_', '')] = movPg[key];
            else if (key.startsWith('imp_')) movimento.imposto[key.replace('imp_', '')] = movPg[key];
            else if (key.startsWith('icms_')) movimento.imposto.icms[key.replace('icms_', '')] = movPg[key];
            else movimento[key] = movPg[key];
          });
          movimentos.push(movimento);
        });
        resolve(movimentos);
      })
      .catch(e => reject(e));
  });
}

function calcularImpostoServicoPg(chaveNotaServico) {
  return new Promise((resolve, reject) => {
    pg.from('tb_nota_servico').where({ chave: chaveNotaServico })
      .then(([notaPg]) => {
        const { emitente_cpfcnpj: emitente, status } = notaPg;

        if (status === 'CANCELADA') {
          resolve({
            imposto: {
              iss: 0,
              irpj: 0,
              csll: 0,
              cofins: 0,
              pis: 0,
              total: 0,
            },
            retencao: {
              iss: 0,
              irpj: 0,
              pis: 0,
              cofins: 0,
              csll: 0,
              inss: 0,
              total: 0,
            },
          });
        }

        const calcularImpostoPromise = new Promise((resolveImposto, rejectImposto) => {
          pg.from('tb_aliquota').where({
            dono_cpfcnpj: emitente,
            ativo: true,
          })
            .then(([aliquotaPg]) => {
              if (aliquotaPg.tributacao === 'SN') rejectImposto(new Error('Simples Nacional não suportado!'));

              const imposto = {
                iss: 0,
                irpj: 0,
                csll: 0,
                cofins: 0,
                pis: 0,
              };
              let total = 0;

              aliquotaPg.irpj = 0.048; // eslint-disable-line
              aliquotaPg.csll = 0.0288; // eslint-disable-line
              Object.keys(imposto).forEach((impostoNome) => {
                const valor = aliquotaPg[impostoNome] * notaPg.valor;
                imposto[impostoNome] = valor;
                total += valor;
              });

              resolveImposto({
                ...imposto,
                total,
              });
            }).catch(e => rejectImposto(e));
        });

        const calcularRetencaoPromise = new Promise((resolveRetencao, rejectRetencao) => {
          pg.from('tb_retencao').where({
            id: notaPg.retencao_id,
          })
            .then(([retencaoPg]) => {
              if (retencaoPg.total === null) retencaoPg.total = 0; // eslint-disable-line
              resolveRetencao(retencaoPg);
            }).catch(e => rejectRetencao(e));
        });

        Promise.all([
          calcularImpostoPromise,
          calcularRetencaoPromise,
        ]).then(([imposto, retencao]) => resolve({ imposto, retencao })).catch(e => reject(e));
      }).catch(e => reject(e));
  });
}

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

function eMovimentoInterno(nota) {
  return nota.estado_gerador_id === nota.estado_destino_id;
}

function eDestinatarioContribuinte(nota) {
  return nota.destinatario_contribuinte === '1';
}

function calcularImpostoMovimentoPg(notaInicialChave, notaFinalChave) {
  return new Promise((resolve, reject) => {
    pg.from('tb_nota').where({ chave: notaFinalChave }).then(([notaFinalPg]) => {
      if (notaFinalPg.estado_gerador_id !== 11) reject(new Error('Estado informado não suportado!'));

      const movimento = {
        dono_cpfcnpj: notaFinalPg.emitente_cpfcnpj,
        valor_saida: notaFinalPg.valor,
      };

      pg.from('tb_nota').where({ chave: notaInicialChave }).then(([notaInicialPg]) => {
        movimento.lucro = notaFinalPg.valor - notaInicialPg.valor;

        if (movimento.lucro < 0 &&
          !eMovimentoInterno(notaFinalPg)) {
          movimento.lucro = 0;
        }
        if ((movimento.lucro <= 0 && !cfopDevolucao.includes(notaFinalPg.cfop)) ||
          cfopDevolucaoConsignacao.includes(notaFinalPg.cfop) ||
          cfopDevolucaoDemonstracao.includes(notaFinalPg.cfop)) {
          resolve({
            lucro: 0,
            valor_saida: notaFinalPg.valor,
            imposto: {
              pis: 0,
              cofins: 0,
              csll: 0,
              irpj: 0,
              icms: {
                base_calculo: 0,
                proprio: 0,
              },
              total: 0,
            },
          });
        }

        const devolucaoPromise = new Promise((resolveDevolucao) => {
          if (cfopDevolucao.includes(notaFinalPg.cfop)) {
            pg.table('tb_movimento')
              .innerJoin('tb_meta_dados', 'tb_movimento.meta_dados_id', 'tb_meta_dados.md_id')
              .where('tb_movimento.nota_final_chave', notaInicialChave)
              .andWhere('tb_meta_dados.ativo', true)
              .then(([movimentoAnteriorPg]) => {
                movimento.lucro = movimentoAnteriorPg ? (-1) * movimentoAnteriorPg.lucro : 0;
                movimento.valor_saida = 0;
                resolveDevolucao();
              });
          } else resolveDevolucao();
        });

        devolucaoPromise.then(() => {
          pg.from('tb_aliquota').where({
            dono_cpfcnpj: movimento.dono_cpfcnpj,
            ativo: true,
          }).then(([aliquotaPg]) => {
            movimento.imposto = {
              total: 0,
            };
            impostosFederais.forEach((impostoNome) => {
              const valor = movimento.lucro * aliquotaPg[impostoNome];
              movimento.imposto[impostoNome] = valor;
              movimento.imposto.total += valor;
            });

            const icmsPromise = new Promise((resolveIcms, rejectIcms) => {
              if (eMovimentoInterno(notaFinalPg)) {
                movimento.imposto.icms = {
                  baseDeCalculo: (movimento.lucro * aliquotaPg.icms_reducao),
                  proprio: (movimento.lucro * aliquotaPg.icms_reducao * aliquotaPg.icms_aliquota),
                };
                movimento.imposto.total += movimento.imposto.icms.proprio;
                resolveIcms();
              }

              pg.from('tb_difal_aliquota')
                .where({ estado_id: notaFinalPg.estado_destino_id })
                .then(([aliquotaDifalPg]) => {
                  if (!aliquotaDifalPg) rejectIcms(new Error('Estado não suportado!'));

                  if (eDestinatarioContribuinte(notaFinalPg)) {
                    const baseDeCalculo = 0.05 * movimento.valor_saida;

                    const valor = baseDeCalculo * aliquotaDifalPg.externo;

                    movimento.imposto.icms = {
                      composicao_base: null,
                      difal: null,
                      base_calculo: baseDeCalculo,
                      proprio: valor,
                    };

                    movimento.imposto.total += valor;
                    resolveIcms();
                  } else {
                    const estadosSemReducao = [20/* RN */, 5/* BA */, 23/* RS */, 27/* TO */];
                    const composicaoDaBase = movimento.valor_saida;
                    const baseDeCalculo = 0.05 * composicaoDaBase;
                    const baseDifal =
                      estadosSemReducao.includes(notaFinalPg.estado_destino_id) ?
                        composicaoDaBase :
                        baseDeCalculo;
                    const proprio = baseDifal * aliquotaDifalPg.externo;
                    const difal = (baseDifal * aliquotaDifalPg.interno) - proprio;

                    movimento.imposto.icms = {
                      composicao_base: composicaoDaBase,
                      base_calculo: baseDeCalculo,
                      proprio,
                      difal_origem: 0,
                      difal_destino: difal,
                    };

                    movimento.imposto.total += difal + proprio;
                    resolveIcms();
                  }
                });
            });

            icmsPromise.then(() => resolve(movimento));
          });
        });
      });
    });
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

function calcularTotalEmpresaPg(cnpj, competencia) {
  return new Promise((resolve, reject) => {
    const total = {
      dono_cpfcnpj: cnpj,
      data_hora: new Date(competencia.ano, competencia.mes - 1),
    };

    const promiseServico = new Promise((resolveServico, rejectServico) => {
      const total_servico = { // eslint-disable-line
        imposto: {
          iss: 0,
          pis: 0,
          cofins: 0,
          irpj: 0,
          csll: 0,
          total: 0,
        },
        retencao: {
          iss: 0,
          pis: 0,
          cofins: 0,
          irpj: 0,
          csll: 0,
          inss: 0,
          total: 0,
        },
        total: 0,
      };
      pegarServicosMesPg(cnpj, competencia).then((servicos) => {
        servicos.forEach((servico) => {
          if (servico.nota.status === 'NORMAL') {
            total_servico.total += servico.valor;
            Object.keys(total_servico.retencao).forEach((imp) => {
              if (servico.retencao[imp]) total_servico.retencao[imp] += servico.retencao[imp];
            });

            Object.keys(total_servico.imposto).forEach((imp) => {
              if (servico.imposto[imp]) total_servico.imposto[imp] += servico.imposto[imp];
            });
          }
        });

        resolveServico(total_servico);
      }).catch(e => rejectServico(e));
    });

    const promiseMovimento = new Promise((resolveMovimento, rejectMovimento) => {
      const total_movimento = { // eslint-disable-line
        imposto: {
          pis: 0,
          cofins: 0,
          irpj: 0,
          csll: 0,
          total: 0,
          icms: {
            base_calculo: 0,
            proprio: 0,
            difal_destino: 0,
            difal_origem: 0,
          },
        },
        incial_valor: 0,
        final_valor: 0,
        valor_saida: 0,
        lucro: 0,
      };
      pegarMovimentosMesPg(cnpj, competencia).then((movimentos) => {
        movimentos.forEach((movimento) => {
          total_movimento.valor_saida += movimento.valor_saida;
          total_movimento.lucro += movimento.lucro;
          total_movimento.incial_valor += movimento.incial_valor;
          total_movimento.final_valor += movimento.final_valor;
          Object.keys(total_movimento.imposto).forEach((key) => {
            if (key === 'icms') {
              Object.keys(total_movimento.imposto.icms).forEach((icmsKey) => {
                total_movimento.imposto.icms[icmsKey] += movimento.imposto.icms[icmsKey];
              });
            } else {
              total_movimento.imposto[key] += movimento.imposto[key];
            }
          });
        });

        resolveMovimento(total_movimento);
      }).catch(e => rejectMovimento(e));
    });

    Promise.all([
      promiseServico,
      promiseMovimento,
    ]).then(([total_servico, total_movimento]) => {
      const total_soma = {
        valor_movimento: total_movimento.lucro,
        valor_servico: total_servico.total,
        imposto: {
          iss: total_servico.imposto.iss,
          pis: total_servico.imposto.pis + total_movimento.imposto.pis,
          cofins: total_servico.imposto.cofins + total_movimento.imposto.cofins,
          irpj: total_servico.imposto.irpj + total_movimento.imposto.irpj,
          csll: total_servico.imposto.csll + total_movimento.imposto.csll,
          total: total_servico.imposto.total + total_movimento.imposto.total,
          icms: total_movimento.imposto.icms,
        },
        retencao: total_servico.retencao,
      };

      resolve({ total_servico, total_movimento, total_soma });
    }).catch(e => reject(e));
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
