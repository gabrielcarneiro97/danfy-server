const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { xml2js } = require('xml-js');
const {
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
} = require('./services');
// const bodyParser = require('body-parser');
const app = express();
const upload = multer();

app.options('*', cors());
app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

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

const server = app.listen(8080, () => {
  const { address } = server.address();
  const { port } = server.address();
  console.log(`Example app listening at http://${address}:${port}`);
});
