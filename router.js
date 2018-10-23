const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { xml2js } = require('xml-js');
const bodyParser = require('body-parser');
const {
  lerNfe,
  lerNfse,
  criarPessoa,
  criarNota,
  criarNotaServico,
  pegarEmpresaAliquotas,
  pegarNotaChave,
  pegarNotaServicoChave,
  pegarNotasProdutoEmitente,
  calcularImpostosMovimento,
  calcularImpostosServico,
  criarNotaSlim,
  totaisTrimestrais,
  pegarMovimentosMes,
  pegarServicosMes,
  validarMovimento,
} = require('./services');

const app = express();
const upload = multer();

app.options('*', cors());
app.use(cors());

app.post('/file', upload.single('file'), (req, res) => {
  const { file } = req;
  const xml = file.buffer.toString('utf-8');
  const obj = xml2js(xml, { compact: true });

  let final = {};

  if (obj.CompNfse) {
    lerNfse(obj, (nota, emitente, destinatario) => {
      final = {
        tipo: 'nfse',
        pessoas: { [nota.emitente]: emitente, [nota.destinatario]: destinatario },
        nota,
      };

      const promises = [
        criarPessoa(nota.emitente, emitente),
        criarPessoa(nota.destinatario, destinatario),
        criarNotaServico(nota.chave, nota),
      ];

      Promise.all(promises).then(() => {
        res.send(final);
      }).catch((err) => {
        res.status(400).send({ ...final, err });
      });
    });
  } else if (obj.nfeProc) {
    lerNfe(obj, (nota, emitente, destinatario) => {
      final = {
        tipo: 'nfe',
        pessoas: { [nota.emitente]: emitente, [nota.destinatario]: destinatario },
        nota,
      };

      const promises = [
        criarPessoa(nota.emitente, emitente),
        criarPessoa(nota.destinatario, destinatario),
        criarNota(nota.chave, nota),
      ];

      Promise.all(promises).then(() => {
        res.send(final);
      }).catch((err) => {
        res.status(400).send({ ...final, err });
      });
    });
  } else {
    res.sendStatus(400);
  }
});

app.post('/movimentos', bodyParser.json(), (req, res) => {
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
});

app.get('/servico', (req, res) => {
  const { notaServico } = req.query;
  let { dominioId, email } = req.query;
  dominioId = decodeURI(dominioId);
  email = decodeURI(email);
  pegarNotaServicoChave(notaServico).then((notaServicoObj) => {
    calcularImpostosServico(notaServicoObj).then((valores) => {
      const servico = {
        nota: notaServico,
        dominio: dominioId,
        conferido: true,
        valores,
        metaDados: {
          criadoPor: email,
          dataCriacao: new Date().toISOString(),
        },
        data: notaServicoObj.geral.dataHora,
        notaStatus: notaServicoObj.geral.status,
      };
      res.send(servico);
    }).catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
  }).catch((err) => {
    console.error(err);
    res.sendStatus(500);
  });
});

app.get('/movimentos/valor', (req, res) => {
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
});

app.get('/movimentos/slim', (req, res) => {
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
});

app.get('/trimestre', (req, res) => {
  const data = {};
  const {
    cnpj,
    mes,
    ano,
    recalcular,
  } = req.query;
  const notas = {};

  const promises = [];

  pegarMovimentosMes(cnpj, { mes, ano }).then((movs) => {
    data.movimentos = movs;
    Object.keys(movs).forEach((k) => {
      promises.push(new Promise((resolve) => {
        const m = movs[k];
        pegarNotaChave(m.notaInicial).then((n1) => {
          pegarNotaChave(m.notaFinal).then((n2) => {
            notas[n1.chave] = n1;
            notas[n2.chave] = n2;
            data.notas = notas;
            resolve();
          }).catch((err) => { console.error(err); });
        }).catch((err) => { console.error(err); });
      }));
    });

    pegarServicosMes(cnpj, { mes, ano }).then((servs) => {
      data.servicos = servs;
      Promise.all(promises).then(() => {
        totaisTrimestrais(cnpj, { mes, ano }, recalcular).then((trim) => {
          data.trimestre = trim;
          console.log(trim);
          res.send(data);
        }).catch((err) => { data.err = err; });
      }).catch(err => console.error(err));
    }).catch((err) => { data.err = err; });
  }).catch((err) => { console.error(err); });
});

module.exports = {
  app,
};
