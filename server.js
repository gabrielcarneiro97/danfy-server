const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { xml2js } = require('xml-js');
const {
  lerNfe,
  lerNfse,
} = require('./services');
// const bodyParser = require('body-parser');

const app = express();
const upload = multer();

app.options('*', cors());
app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.get('/hello', (req, res) => {
  res.send('hello');
});

app.post('/file', upload.single('file'), (req, res) => {
  const { file } = req;
  const xml = file.buffer.toString('utf-8');
  const obj = xml2js(xml, { compact: true });

  let final = {};

  if (obj.CompNfse) {
    lerNfse(obj, (nota, emitente, destinatario) => {
      final = {
        tipo: 'nfse',
        nota,
        emitente,
        destinatario,
      };
      // gravarPessoa(notaServico.emitente, emitente, err => {
      //   if (err) {
      //     console.error(err)
      //   }
      // })
      // gravarPessoa(notaServico.destinatario, destinatario, err => {
      //   if (err) {
      //     console.error(err)
      //   }
      // })
      // gravarNotaServico(notaServico.chave, notaServico, err => {
      //   if (err) {
      //     console.error(err)
      //   }
      // })
      res.send(final);
    });
  } else if (obj.nfeProc) {
    lerNfe(obj, (nota, emitente, destinatario) => {
      final = {
        tipo: 'nfe',
        nota,
        emitente,
        destinatario,
      };

      // gravarPessoa(nota.emitente, emitente, err => {
      //   if (err) {
      //     console.error(err)
      //   }
      // })
      // gravarPessoa(nota.destinatario, destinatario, err => {
      //   if (err) {
      //     console.error(err)
      //   }
      // })
      // gravarNota(nota.chave, nota, err => {
      //   if (err) {
      //     console.error(err)
      //   }
      // })

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
