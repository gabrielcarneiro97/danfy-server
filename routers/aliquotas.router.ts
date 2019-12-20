import * as express from 'express';
import * as bodyParser from 'body-parser';

import {
  pegarEmpresaAliquota,
  criarAliquota,
} from '../services/postgres/aliquota.service';

const aliquotasRouter = express();

aliquotasRouter.post('/', bodyParser.json(), async (req, res) => {
  const { aliquota } = req.body;
  try {
    await criarAliquota(aliquota);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

aliquotasRouter.get('/:cnpj', async (req, res) => {
  const { cnpj } = req.params;
  try {
    const aliquota = await pegarEmpresaAliquota(cnpj);
    res.send(aliquota);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

export default aliquotasRouter;
