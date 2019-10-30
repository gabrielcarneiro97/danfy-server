const express = require('express');
const bodyParser = require('body-parser');
const { stringToDate, stringToDate2 } = require('../services/calculador.service');

console.log(stringToDate('01-01-2019'));
console.log(stringToDate2('01-01-2019'));

const {
  criarNotaPoolSlim,
  pegarNotasPoolProdutoEmitente,
  pegarMovimentoPoolNotaFinal,
  cancelarMovimento,
  pegarMovimentoPoolId,
  movimentoPoolFromObj,
} = require('../services/postgres');

const {
  validarMovimento,
} = require('../services/calculador.service');

const {
  calcularMovimentoPool,
  calcularTrimestre,
  pegarTrimestreComNotas,
} = require('../services/impostos.service');

const {
  NotaPool,
} = require('../services/postgres/pools');

const movimentoRouter = express();

movimentoRouter.post('/calcular', bodyParser.json(), async (req, res) => {
  const { notasFinaisChave, usuario } = req.body;
  const notasIniciais = [];

  const promises = notasFinaisChave.map(async (notaFinalChave) => {
    let movimento;
    const notaFinalPool = await NotaPool.getByChave(notaFinalChave);
    const { nota: notaFinal, produtos } = notaFinalPool;

    const prodPromises = produtos.map(async (produto) => {
      const { nome } = produto;
      const notasProd = await pegarNotasPoolProdutoEmitente(nome, notaFinal.emitenteCpfcnpj);
      return notasProd;
    });

    const promisesRes = await Promise.all(prodPromises);

    const notasPool = [].concat(...promisesRes);

    const notaInicialPool = notasPool
      .find((notaPool) => validarMovimento(notaPool, notaFinalPool).isValid);

    if (notaInicialPool) {
      notasIniciais.push(notaInicialPool);
      movimento = await calcularMovimentoPool(notaInicialPool.nota.chave, notaFinalChave);
    } else {
      movimento = await calcularMovimentoPool(null, notaFinalChave);
    }
    movimento.metaDados.email = usuario.email;
    return movimento;
  });

  const movimentos = await Promise.all(promises);
  res.send({ movimentos, notasIniciais });
});
movimentoRouter.post('/push', bodyParser.json(), async (req, res) => {
  const { movimentoPool: movPoolFlat, donoCpfcnpj } = req.body;
  let { valorInicial } = req.body;

  const movimentoPool = movimentoPoolFromObj(movPoolFlat);
  const { movimento } = movimentoPool;

  try {
    const movimentoExiste = await pegarMovimentoPoolNotaFinal(movimento.notaFinalChave);

    if (movimentoExiste) {
      res.status(409).send({ error: `Nota já registrada em outro serviço! ID: ${movimentoExiste.movimento.id}` });
    } else if (movimento.notaInicialChave) {
      await movimentoPool.save();
      res.sendStatus(201);
    } else {
      valorInicial = parseFloat(valorInicial.toString().replace(',', '.'));

      const notaInicialPool = await criarNotaPoolSlim(valorInicial, donoCpfcnpj);
      const { chave: notaInicialChave } = notaInicialPool.nota;
      const { notaFinalChave } = movimento;

      await (await calcularMovimentoPool(notaInicialChave, notaFinalChave)).save();
      res.sendStatus(201);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

movimentoRouter.get('/valor', async (req, res) => {
  const { notaInicialChave, notaFinalChave } = req.query;
  try {
    const movimentoPool = await calcularMovimentoPool(notaInicialChave, notaFinalChave);
    res.send(movimentoPool);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
movimentoRouter.get('/slim', async (req, res) => {
  const { notaFinalChave, cnpj } = req.query;
  let { valorInicial } = req.query;

  valorInicial = valorInicial ? parseFloat(valorInicial.toString().replace(',', '.')) : 0;

  try {
    const notaInicialPool = await criarNotaPoolSlim(valorInicial, cnpj);
    const { chave: notaInicialChave } = notaInicialPool.nota;
    const movimentoPool = await calcularMovimentoPool(notaInicialChave, notaFinalChave);
    res.send({ movimentoPool, notaInicialPool });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
movimentoRouter.get('/notaFinal', async (req, res) => {
  const { notaFinalChave } = req.query;
  try {
    const movimento = await pegarMovimentoPoolNotaFinal(notaFinalChave);
    res.send(movimento);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

movimentoRouter.put('/cancelar', async (req, res) => {
  const { cnpj, movimentoId } = req.query;

  try {
    await cancelarMovimento(movimentoId);
    const movimentoPool = await pegarMovimentoPoolId(movimentoId);

    const { movimento } = movimentoPool;

    const mes = (movimento.dataHora.getMonth() + 1);
    const ano = movimento.dataHora.getFullYear();

    await calcularTrimestre(cnpj, { mes, ano });

    const trim = await pegarTrimestreComNotas(cnpj, { mes, ano });

    res.send(trim);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

movimentoRouter.put('/editar', bodyParser.json(), async (req, res) => {
  const { cnpj, movimentoAntigoId } = req.query;
  const { movimentoNovoObj } = req.body;

  const movimentoData = new Date(movimentoNovoObj.movimento.dataHora);

  const mes = (movimentoData.getMonth() + 1);
  const ano = movimentoData.getFullYear();

  try {
    const movimentoPoolNovo = await movimentoPoolFromObj(movimentoNovoObj);
    await cancelarMovimento(movimentoAntigoId);
    await movimentoPoolNovo.save();

    await calcularTrimestre(cnpj, { mes, ano });

    const trim = await pegarTrimestreComNotas(cnpj, { mes, ano });

    res.send(trim);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = movimentoRouter;
