const express = require('express');

const {
  calcularSimples,
  recalcularSimples,
  pegarSimplesComNotas,
} = require('../services/simples.service');

const simplesRouter = express();

simplesRouter.get('/', async (req, res) => {
  const {
    cnpj,
    mes,
    ano,
  } = req.query;

  try {
    const data = await pegarSimplesComNotas(cnpj, { mes, ano });

    if (!data.simplesData.simples) {
      const simples = await calcularSimples(cnpj, { mes, ano });
      await simples.save();
      data.simplesData.simples = simples;
    }
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

simplesRouter.put('/:cnpj/:mes/:ano', async (req, res) => {
  const {
    cnpj,
    mes,
    ano,
  } = req.params;

  try {
    await recalcularSimples(cnpj, { mes, ano });
    const data = await pegarSimplesComNotas(cnpj, { mes, ano });

    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = simplesRouter;
