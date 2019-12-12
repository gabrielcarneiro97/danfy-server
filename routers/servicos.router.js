const express = require('express');
const bodyParser = require('body-parser');

const {
  servicoPoolFromObj,
} = require('../services/postgres/servico.service');

const {
  calcularServicoPool,
} = require('../services/impostos.service');

const {
  pegarTrimestreComNotas,
  recalcularTrimestre,
} = require('../services/trimestre.service');

const {
  pegarSimplesComNotas,
  recalcularSimples,
} = require('../services/simples.service');

const { Aliquota } = require('../services/postgres/models');

const { ServicoPool } = require('../services/postgres/pools');

const servicosRouter = express();

servicosRouter.get('/calcular', async (req, res) => {
  let { notaServicoChave } = req.query;
  notaServicoChave = decodeURI(notaServicoChave);
  try {
    const servicoPool = await calcularServicoPool(notaServicoChave);
    res.send(servicoPool);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

servicosRouter.get('/id', async (req, res) => {
  try {
    const { servicoId } = req.query;
    const servicoPool = await ServicoPool.getById(servicoId);
    res.send(servicoPool);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

servicosRouter.get('/nota', async (req, res) => {
  const { notaChave } = req.query;
  try {
    const servicoPool = await ServicoPool.getByNotaChave(notaChave);
    res.send(servicoPool);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

servicosRouter.post('/push', bodyParser.json(), async (req, res) => {
  const { servicoPool: servObj } = req.body;
  try {
    const servicoPool = servicoPoolFromObj(servObj);
    const existe = await ServicoPool.getByNotaChave(servicoPool.servico.notaChave);

    if (existe) await existe.save();
    else await servicoPool.save();

    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

servicosRouter.delete('/id', async (req, res) => {
  const { servicoId, cnpj } = req.query;

  try {
    const servicoPool = await ServicoPool.getById(servicoId);

    const data = new Date(servicoPool.servico.dataHora);
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();

    await servicoPool.del();

    const [aliquota] = await Aliquota.getBy({
      donoCpfcnpj: cnpj,
      ativo: true,
    });

    if (aliquota.tributacao === 'SN') {
      await recalcularSimples(cnpj, { mes, ano });
      const simples = await pegarSimplesComNotas(cnpj, { mes, ano });
      res.send(simples);
    } else {
      await recalcularTrimestre(cnpj, { mes, ano });
      const trim = await pegarTrimestreComNotas(cnpj, { mes, ano });
      res.send(trim);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = servicosRouter;
