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
    await new Grupo({
      donoCpfcnpj: cnpj,
      descricao,
      nome,
      cor,
    }).save();
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
});

grupoRouter.put('/:cnpj', bodyParser.json(), async (req, res) => {
  const {
    id,
    descricao,
    nome,
    cor,
  } = req.body;

  const { cnpj } = req.params;

  try {
    const [grupo] = await Grupo.getBy({ id, donoCpfcnpj: cnpj });

    if (!grupo) {
      await new Grupo({
        donoCpfcnpj: cnpj,
        descricao,
        nome,
        cor,
      }).save();
      res.sendStatus(201);
    } else {
      grupo.nome = nome || grupo.nome;
      grupo.descricao = descricao || grupo.descricao;
      grupo.cor = cor || grupo.cor;

      await grupo.save();
      res.sendStatus(201);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = grupoRouter;
