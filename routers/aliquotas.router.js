const express = require('express');
const bodyParser = require('body-parser');

const {
  pegarEmpresaAliquota,
  criarAliquota,
} = require('../services/postgres/aliquota.service');

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

aliquotasRouter.get('/', async (req, res) => {
  const { cnpj } = req.query;
  try {
    const aliquota = await pegarEmpresaAliquota(cnpj);
    res.send(aliquota);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = aliquotasRouter;
