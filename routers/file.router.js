const { xml2js } = require('xml-js');
const express = require('express');
const multer = require('multer');

const {
  notaPessoaToPool,
  notaXmlToPool,
  notaServicoXmlToPool,
} = require('../services/postgres');
const {
  lerNfe,
  lerNfse,
} = require('../services/xml.service');

const fileRouter = express();
const upload = multer();

fileRouter.post('/', upload.single('file'), async (req, res) => {
  const { file } = req;
  const xml = file.buffer.toString('utf-8');
  const obj = xml2js(xml, { compact: true });
  let final = {};

  if (obj.CompNfse) {
    lerNfse(obj, async (notaParam, emitente, destinatario) => {
      try {
        const [emitentePessoaPool, destinatarioPessoaPool] = await Promise.all([
          notaPessoaToPool(notaParam.emitente, emitente),
          notaPessoaToPool(notaParam.destinatario, destinatario),
        ]);

        const notaPool = await notaServicoXmlToPool(notaParam);
        final = {
          tipo: 'nfse',
          pessoas: [emitentePessoaPool, destinatarioPessoaPool],
          notaPool,
        };

        res.send(final);
      } catch (err) {
        console.error(err);
        res.status(500).send(err);
      }
    });
  } else if (obj.nfeProc) {
    lerNfe(obj, async (nota, emitente, destinatario) => {
      try {
        const [emitentePessoaPool, destinatarioPessoaPool] = await Promise.all([
          notaPessoaToPool(nota.emitente, emitente),
          notaPessoaToPool(nota.destinatario, destinatario),
        ]);

        const notaPool = await notaXmlToPool(nota);

        final = {
          tipo: 'nfe',
          pessoas: [emitentePessoaPool, destinatarioPessoaPool],
          notaPool,
        };
        res.send(final);
      } catch (err) {
        console.error(err);
        res.status(500).send(err);
      }
    });
  } else {
    res.sendStatus(400);
  }
});

module.exports = fileRouter;
