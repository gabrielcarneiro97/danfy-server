const express = require('express');

const {
  calcularTrimestre,
  pegarTrimestreComNotas,
  recalcularTrimestre,
} = require('../services/impostos.service');

const trimestreRouter = express();

trimestreRouter.get('/', async (req, res) => {
  const {
    cnpj,
    mes,
    ano,
  } = req.query;

  try {
    const calcTrim = await calcularTrimestre(cnpj, { mes, ano });
    const trim = await pegarTrimestreComNotas(cnpj, { mes, ano });

    if (!trim.trimestreData.trim.total.id) {
      await calcTrim.trim.save();
      trim.trimestreData.trim = calcTrim.trim;
    }
    res.send(trim);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

trimestreRouter.put('/', async (req, res) => {
  const {
    cnpj,
    mes,
    ano,
  } = req.query;

  try {
    await recalcularTrimestre(cnpj, { mes, ano });
    const trim = await pegarTrimestreComNotas(cnpj, { mes, ano });

    res.send(trim);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = trimestreRouter;
