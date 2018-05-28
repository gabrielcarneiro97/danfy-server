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

const server = app.listen(8080, () => {
  const { address } = server.address();
  const { port } = server.address();
  console.log(`Example app listening at http://${address}:${port}`);
});
