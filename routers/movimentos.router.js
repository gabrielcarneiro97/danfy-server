const {
  criarNotaSlim,
  pegarNotasProdutoEmitente,
  pegarNotaChave,
  pegarEmpresaAliquotas,
} = require('../services/mongoose.service');

const {
  validarMovimento,
  calcularImpostosMovimento,
} = require('../services/calculador.service');


function root(req, res) {
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
}

function valor(req, res) {
  const { notaInicial, notaFinal, cnpj } = req.query;
  pegarEmpresaAliquotas(cnpj).then((aliquotas) => {
    pegarNotaChave(notaInicial).then((notaInicialObj) => {
      pegarNotaChave(notaFinal).then((notaFinalObj) => {
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
}

function slim(req, res) {
  const { notaFinal, cnpj } = req.query;
  let { valorInicial } = req.query;

  valorInicial = parseFloat(valorInicial.toString().replace(',', '.'));

  pegarNotaChave(notaFinal).then((notaFinalObj) => {
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
}

module.exports = {
  root,
  valor,
  slim,
};
