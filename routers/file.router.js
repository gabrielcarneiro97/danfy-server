const express = require('express');
const multer = require('multer');

const {
  notaPessoaToPool,
  notaXmlToPool,
  notaServicoXmlToPool,
} = require('../services/postgres');
const {
  lerNfe,
} = require('../services/xml.service');

const {
  xmlToObj,
  servico,
  danfe,
} = require('../services/xml');

const fileRouter = express();
const upload = multer();

fileRouter.post('/', upload.single('file'), async (req, res) => {
  const { file } = req;
  const obj = xmlToObj(file);
  let final = {};

  if (danfe.eDanfe(obj)) {
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
    const {
      notaServico,
      emitente,
      destinatario,
      desconhecida,
    } = servico.localizador.qualCidade(obj)(obj);

    console.log(notaServico,
      emitente,
      destinatario,
      desconhecida);

    if (desconhecida) {
      res.status(500).send();
    } else {
      try {
        const [emitentePessoaPool, destinatarioPessoaPool] = await Promise.all([
          notaPessoaToPool(notaServico.emitente, emitente),
          notaPessoaToPool(notaServico.destinatario, destinatario),
        ]);

        const notaPool = await notaServicoXmlToPool(notaServico);
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
    }
  }
});

module.exports = fileRouter;
