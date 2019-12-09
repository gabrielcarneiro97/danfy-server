const express = require('express');
const multer = require('multer');

const {
  notaPessoaToPool,
  notaXmlToPool,
  notaServicoXmlToPool,
} = require('../services/postgres');

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

  if (danfe.eDanfe(obj)) {
    const { nota, emitente, destinatario } = danfe.leitor(obj);
    try {
      const pessoas = await Promise.all([
        notaPessoaToPool(nota.emitente, emitente),
        notaPessoaToPool(nota.destinatario, destinatario),
      ]);

      const notaPool = await notaXmlToPool(nota);

      return res.send({
        tipo: 'nfe',
        pessoas,
        notaPool,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  }

  const {
    notaServico,
    emitente,
    destinatario,
    desconhecida,
  } = servico.localizador.qualCidade(obj)(obj);

  if (desconhecida) {
    return res.status(500).send('Cidade não suportada!');
  }

  try {
    const pessoas = await Promise.all([
      notaPessoaToPool(notaServico.emitente, emitente),
      notaPessoaToPool(notaServico.destinatario, destinatario),
    ]);

    const notaPool = await notaServicoXmlToPool(notaServico);

    return res.send({
      tipo: 'nfse',
      pessoas,
      notaPool,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
});

module.exports = fileRouter;
