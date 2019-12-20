import * as express from 'express';

import {
  calcularTrimestre,
  pegarTrimestreComNotas,
  recalcularTrimestre,
} from '../services/trimestre.service';

const trimestreRouter = express();

trimestreRouter.get('/:cnpj/:mes/:ano', async (req, res) => {
  const {
    cnpj,
    mes,
    ano,
  } = req.params;

  try {
    const trim = await pegarTrimestreComNotas(cnpj, { mes, ano });

    if (!trim.trimestreData.trim.total.id) {
      const calcTrim = await calcularTrimestre(cnpj, { mes, ano });
      await calcTrim.trim.save();
      trim.trimestreData.trim = calcTrim.trim;
    }
    res.send(trim);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

trimestreRouter.put('/:cnpj/:mes/:ano', async (req, res) => {
  const {
    cnpj,
    mes,
    ano,
  } = req.params;

  try {
    await recalcularTrimestre(cnpj, { mes, ano });
    const trim = await pegarTrimestreComNotas(cnpj, { mes, ano });

    res.send(trim);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

export default trimestreRouter;
