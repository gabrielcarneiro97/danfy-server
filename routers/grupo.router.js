const express = require('express');
const bodyParser = require('body-parser');

const { Grupo } = require('../services/postgres/models');

const grupoRouter = express();

grupoRouter.get('/:cnpj', async (req, res) => {
  const { cnpj } = req.params;
  try {
    const grupos = await Grupo.getBy({ donoCpfcnpj: cnpj });
    res.send(grupos);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

grupoRouter.post('/:cnpj', bodyParser.json(), async (req, res) => {
  const {
    descricao,
    nome,
    cor,
  } = req.body;

  const { cnpj } = req.params;
  try {
    const grupo = new Grupo({
      donoCpfcnpj: cnpj,
      descricao,
      nome,
      cor,
    });
    await grupo.save();
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = grupoRouter;
