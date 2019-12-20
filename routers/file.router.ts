import * as express from 'express';
import * as multer from 'multer';

import { notaPessoaToPool } from '../services/postgres/pessoa.service';

import { notaXmlToPool } from '../services/postgres/nota.service';

import { notaServicoXmlToPool } from '../services/postgres/notaServico.service';

import {
  xmlToObj,
  servico,
  danfe,
} from '../services/xml';

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

  return res.send(responses);
});

export default fileRouter;
