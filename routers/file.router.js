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

      return res.send([{
        tipo: 'nfe',
        pessoas,
        notaPool,
      }]);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  }

  const notasServico = servico.localizador.qualCidade(obj)(obj);

  if (notasServico[0] === null) return res.status(500).send('Cidade não suportada!');

  const responses = await Promise.all(
    notasServico.map(async ({ notaServico, emitente, destinatario }) => {
      try {
        const pessoas = await Promise.all([
          notaPessoaToPool(notaServico.emitente, emitente),
          notaPessoaToPool(notaServico.destinatario, destinatario),
        ]);

        const notaPool = await notaServicoXmlToPool(notaServico);

        return {
          tipo: 'nfse',
          pessoas,
          notaPool,
        };
      } catch (err) {
        console.error(err);
        return null;
      }
    }),
  );

  res.send(responses);
});

module.exports = fileRouter;
