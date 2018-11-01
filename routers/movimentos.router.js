const {
  criarNotaSlim,
  pushMovimento,
  pegarNotasProdutoEmitente,
  pegarNotaChave,
  pegarEmpresaAliquotas,
  pegarMovimentoNotaFinal,
  cancelarMovimento,
  pegarMovimentoId,
  pegarMovimentosServicosTotal,
} = require('../services/mongoose.service');

const {
  validarMovimento,
} = require('../services/calculador.service');

const {
  calcularImpostosMovimento,
} = require('../services/impostos.service');

module.exports = {
  post: {
    calcular(req, res) {
      const { notasFinais, usuario } = req.body;
      const promises = [];
      const notasIniciais = [];

      notasFinais.forEach((chave) => {
        const p = new Promise((resolve) => {
          pegarNotaChave(chave).then((nota) => {
            const movimento = {
              notaFinal: chave,
              notaInicial: null,
              data: nota.geral.dataHora,
              conferido: false,
              dominio: usuario.dominio,
              valores: {},
              metaDados: {
                criadoPor: usuario.email,
                dataCriacao: new Date().toISOString(),
                status: 'ATIVO',
                tipo: 'PRIM',
                movimentoRef: '',
              },
            };

            let notas = [];
            const produtos = Object.keys(nota.produtos);

            const promisesProdutos = [];

            produtos.forEach((produto) => {
              const promiseProd = new Promise((resolveProd) => {
                pegarNotasProdutoEmitente(produto, nota.emitente)
                  .then((notasProd) => {
                    notas = notas.concat(notasProd);
                    resolveProd();
                  });
              });

              promisesProdutos.push(promiseProd);
            });

            Promise.all(promisesProdutos).then(() => {
              let includes = false;
              Object.keys(notas).forEach((notaIndex) => {
                const chaveNota = notas[notaIndex].chave;
                if (chaveNota !== nota.chave && validarMovimento(notas[notaIndex], nota).isValid) {
                  includes = true;
                  movimento.notaInicial = chaveNota;
                  pegarEmpresaAliquotas(nota.emitente).then((aliquotas) => {
                    calcularImpostosMovimento(notas[notaIndex], nota, aliquotas)
                      .then((valores) => {
                        movimento.valores = valores;
                        movimento.conferido = true;
                        notasIniciais.push(notas[notaIndex]);
                        resolve(movimento);
                      });
                  });
                }
              });

              if (!includes) {
                pegarEmpresaAliquotas(nota.emitente).then((aliquotas) => {
                  calcularImpostosMovimento(null, nota, aliquotas).then((valores) => {
                    movimento.valores = valores;
                    resolve(movimento);
                  });
                });
              }
            });
          });
        });
        promises.push(p);
      });

      Promise.all(promises).then((movimentos) => {
        res.send({ movimentos, notasIniciais });
      }).catch(err => console.error(err));
    },
    push(req, res) {
      const { movimento, cnpj } = req.body;
      let { valorInicial } = req.body;
      pegarMovimentoNotaFinal(cnpj, movimento.notaFinal).then((movimentoExiste) => {
        if (movimentoExiste) {
          res.status(409).send({ error: `Nota já registrada em outro serviço! ID: ${movimentoExiste._id}` });
        } else if (movimento.notaInicial) {
          pushMovimento(cnpj, movimento).then(() => {
            res.sendStatus(201);
          }).catch((err) => {
            console.error(err);
            res.sendStatus(500);
          });
        } else {
          valorInicial = parseFloat(valorInicial.toString().replace(',', '.'));

          pegarNotaChave(movimento.notaFinal).then((notaFinalObj) => {
            const notaInicial = {
              emitente: 'INTERNO',
              destinatario: notaFinalObj.emitente,
              geral: {
                dataHora: new Date().toISOString(),
                cfop: 'INTERNO',
                naturezaOperacao: 'INTERNO',
                numero: 'INTERNO',
                status: 'INTERNO',
                tipo: 'INTERNO',
              },
              produtos: {
                INTERNO: {
                  descricao: 'INTERNO',
                  quantidade: {
                    numero: '1',
                    tipo: 'UN',
                  },
                  valor: {
                    total: valorInicial,
                  },
                },
              },
              valor: {
                total: valorInicial,
              },
            };
            criarNotaSlim(notaInicial).then((notaInicialCompleta) => {
              pegarEmpresaAliquotas(cnpj).then((aliquotas) => {
                calcularImpostosMovimento(notaInicialCompleta, notaFinalObj, aliquotas)
                  .then((movimentoSlim) => {
                    pushMovimento(cnpj, movimentoSlim).then(() => {
                      res.sendStatus(201);
                    }).catch((err) => {
                      console.error(err);
                      res.sendStatus(500);
                    });
                  }).catch((err) => {
                    console.error(err);
                    res.sendStatus(500);
                  });
              }).catch((err) => {
                console.error(err);
                res.sendStatus(500);
              });
            }).catch((err) => {
              console.error(err);
              res.sendStatus(500);
            });
          });
        }
      });
    },
  },
  get: {
    valor(req, res) {
      const { notaInicialChave, notaFinalChave, cnpj } = req.query;
      pegarEmpresaAliquotas(cnpj).then((aliquotas) => {
        pegarNotaChave(notaInicialChave).then((notaInicialObj) => {
          pegarNotaChave(notaFinalChave).then((notaFinalObj) => {
            calcularImpostosMovimento(notaInicialObj, notaFinalObj, aliquotas)
              .then((movimento) => {
                res.send(movimento);
              }).catch((err) => {
                console.error(err);
                res.sendStatus(500);
              });
          }).catch((err) => {
            console.error(err);
            res.sendStatus(500);
          });
        }).catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
    slim(req, res) {
      const { notaFinalChave, cnpj } = req.query;
      let { valorInicial } = req.query;

      valorInicial = parseFloat(valorInicial.toString().replace(',', '.'));

      pegarNotaChave(notaFinalChave).then((notaFinalObj) => {
        const notaInicial = {
          emitente: 'INTERNO',
          destinatario: notaFinalObj.emitente,
          geral: {
            dataHora: new Date().toISOString(),
            cfop: 'INTERNO',
            naturezaOperacao: 'INTERNO',
            numero: 'INTERNO',
            status: 'INTERNO',
            tipo: 'INTERNO',
          },
          produtos: {
            INTERNO: {
              descricao: 'INTERNO',
              quantidade: {
                numero: '1',
                tipo: 'UN',
              },
              valor: {
                total: valorInicial,
              },
            },
          },
          valor: {
            total: valorInicial,
          },
        };

        criarNotaSlim(notaInicial).then((notaInicialCompleta) => {
          pegarEmpresaAliquotas(cnpj).then((aliquotas) => {
            calcularImpostosMovimento(notaInicialCompleta, notaFinalObj, aliquotas)
              .then((movimento) => {
                res.send({ valores: movimento, notaInicial: notaInicialCompleta });
              }).catch((err) => {
                console.error(err);
                res.sendStatus(500);
              });
          }).catch((err) => {
            console.error(err);
            res.sendStatus(500);
          });
        }).catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
    notaFinal(req, res) {
      const { notaFinalChave, cnpj } = req.query;
      pegarMovimentoNotaFinal(cnpj, notaFinalChave).then((movimento) => {
        res.send(movimento);
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
  },
  put: {
    cancelar(req, res) {
      const { cnpj, movimentoId } = req.query;

      pegarMovimentoId(cnpj, movimentoId).then(({ movimento }) => {
        const mes = (movimento.data.getUTCMonth() + 1).toString();
        const ano = movimento.data.getUTCFullYear().toString();
        cancelarMovimento(cnpj, movimentoId).then(() => {
          pegarMovimentosServicosTotal(cnpj, mes, ano, true).then((data) => {
            res.send(data);
          });
        }).catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
      });
    },
    editar(req, res) {
      const { cnpj, movimentoAntigoId } = req.query;
      const { movimentoNovo } = req.body;

      const movimentoData = new Date(movimentoNovo.data);

      const mes = (movimentoData.getUTCMonth() + 1).toString();
      const ano = movimentoData.getUTCFullYear().toString();

      cancelarMovimento(cnpj, movimentoAntigoId).then(() => {
        pushMovimento(cnpj, movimentoNovo).then(() => {
          pegarMovimentosServicosTotal(cnpj, mes, ano, true).then((data) => {
            res.send(data);
          });
        });
      });
    },
  },
};
