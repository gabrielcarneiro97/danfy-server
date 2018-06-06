const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { xml2js } = require('xml-js');
const bodyParser = require('body-parser');
const https = require('https');
const {
  db,
  lerNfe,
  lerNfse,
  gravarNota,
  gravarNotaServico,
  gravarPessoa,
  pegarEmpresaImpostos,
  pegarNotaChave,
  pegarNotaServicoChave,
  calcularImpostosMovimento,
  calcularImpostosServico,
  gravarNotaSlim,
  totaisTrimestrais,
  pegarMovimentosMes,
  pegarServicosMes,
  validarMovimento,
  SSL,
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
      gravarPessoa(nota.emitente, emitente).catch((err) => {
        console.error(err);
      });
      gravarPessoa(nota.destinatario, destinatario).catch((err) => {
        console.error(err);
      });
      gravarNotaServico(nota.chave, nota).catch((err) => {
        console.error(err);
      });
      res.send(final);
    });
  } else if (obj.nfeProc) {
    lerNfe(obj, (nota, emitente, destinatario) => {
      final = {
        tipo: 'nfe',
        pessoas: { [nota.emitente]: emitente, [nota.destinatario]: destinatario },
        nota,
      };

      gravarPessoa(nota.emitente, emitente).catch((err) => {
        console.error(err);
      });
      gravarPessoa(nota.destinatario, destinatario).catch((err) => {
        console.error(err);
      });
      gravarNota(nota.chave, nota).catch((err) => {
        console.error(err);
      });

      res.send(final);
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
        const query = db.ref('Notas/').orderByChild('emitente').equalTo(nota.emitente);
        query.once('value', (snap) => {
          const notas = snap.val();
          let includes = false;
          Object.keys(notas).forEach((k) => {
            const nota2 = notas[k];
            if (nota2.chave !== nota.chave) {
              const produtos = Object.keys(nota.produtos);
              const produtos2 = Object.keys(nota2.produtos);
              if (!movimento.notaInicial) {
                produtos2.forEach((produto) => {
                  if (produtos.includes(produto) && validarMovimento(nota2, nota).isValid) {
                    includes = true;
                    movimento.notaInicial = nota2.chave;
                    pegarEmpresaImpostos(nota.emitente).then((aliquotas) => {
                      calcularImpostosMovimento(nota2, nota, aliquotas).then((valores) => {
                        movimento.valores = valores;
                        movimento.conferido = true;
                        notasIniciais.push(nota2);
                        resolve(movimento);
                      });
                    });
                  }
                });
              }
            }
          });

          if (!includes) {
            pegarEmpresaImpostos(nota.emitente).then((aliquotas) => {
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

app.get('/valoresMovimento', (req, res) => {
  const { notaInicial, notaFinal, cnpj } = req.query;
  pegarEmpresaImpostos(cnpj).then((aliquotas) => {
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

app.get('/movimentoSlim', (req, res) => {
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

    console.log(notaInicial);

    gravarNotaSlim(notaInicial).then((notaInicialCompleta) => {
      pegarEmpresaImpostos(cnpj).then((aliquotas) => {
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
  const { cnpj, mes, ano } = req.query;
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
        totaisTrimestrais(cnpj, { mes, ano }).then((trim) => {
          data.trimestre = trim;
          res.send(data);
        }).catch((err) => { data.err = err; });
      });
    }).catch((err) => { data.err = err; });
  }).catch((err) => { console.error(err); });
});

app.get('/hello', (req, res) => {
  res.send('Hello!');
});

if (process.argv[2] === 'ssl') {
  https.createServer(SSL, app).listen(8080, () => {
    console.log('SSL server listening 8080 port');
  });
} else {
  const server = app.listen(8080, () => {
    const { address } = server.address();
    const { port } = server.address();
    console.log(`Example app listening at http://${address}:${port}`);
  });
}
