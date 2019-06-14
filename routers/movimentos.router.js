const express = require('express');
const bodyParser = require('body-parser');

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

  const promises = notasFinaisChave.map(notaFinalChave => new Promise(async (resolve, reject) => {
    let movimento;
    try {
      const notaFinalPool = await NotaPool.getByChave(notaFinalChave);
      const { nota: notaFinal, produtos } = notaFinalPool;

      const prodPromises = produtos.map(produto => new Promise(async (resolveProd, rejectProd) => {
        const { nome } = produto;
        try {
          const notasProd = await pegarNotasPoolProdutoEmitente(nome, notaFinal.emitenteCpfcnpj);
          resolveProd(notasProd);
        } catch (err) {
          rejectProd(err);
        }
      }));

      const notasPool = [...(await Promise.all(prodPromises))];

      const notaInicialPool = notasPool
        .find(notaPool => validarMovimento(notaPool.nota, notaFinalPool.nota).isValid);

      if (notaInicialPool) {
        notasIniciais.push(notaInicialPool);
        movimento = await calcularMovimentoPool(notaInicialPool.nota.chave, notaFinalChave);
      } else {
        movimento = await calcularMovimentoPool(null, notaFinalChave);
      }
      movimento.metaDados.email = usuario.email;
      resolve(movimento);
    } catch (err) {
      reject(err);
    }
  }));

  const movimentos = await Promise.all(promises);
  res.send({ movimentos, notasIniciais });
});
movimentoRouter.post('/push', bodyParser.json(), async (req, res) => {
  const { movimentoPool: movPoolFlat, cnpj } = req.body;
  let { valorInicial } = req.body;

  const movimentoPool = movimentoPoolFromObj(movPoolFlat);
  const { movimento } = movimentoPool;

  try {
    const movimentoExiste =
      await pegarMovimentoPoolNotaFinal(movimento.notaFinalChave);

    if (movimentoExiste) {
      res.status(409).send({ error: `Nota já registrada em outro serviço! ID: ${movimentoExiste.movimento.id}` });
    } else if (movimento.notaInicialChave) {
      await movimentoPool.save();
      res.sendStatus(201);
    } else {
      valorInicial = parseFloat(valorInicial.toString().replace(',', '.'));

      const notaInicialPool = await criarNotaPoolSlim(valorInicial, cnpj);
      const { chave: notaInicialChave } = notaInicialPool.nota;
      const { notaFinalChave } = movimento;

      (await calcularMovimentoPool(notaInicialChave, notaFinalChave)).save();
      res.sendStatus(201);
    }
  } catch (err) {
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

  valorInicial = parseFloat(valorInicial.toString().replace(',', '.'));

  try {
    const notaInicialPool = await criarNotaPoolSlim(valorInicial, cnpj);
    const { chave: notaInicialChave } = notaInicialPool.nota;
    const movimento = await calcularMovimentoPool(notaInicialChave, notaFinalChave);
    res.send(movimento);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
movimentoRouter.get('/notaFinal', async (req, res) => {
  const { notaFinalChave } = req.query;
  try {
    const movimento = await pegarMovimentoPoolNotaFinal(notaFinalChave);
    res.send(movimento);
  } catch (err) {
    console.log(err);
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
    console.log(err);
    res.status(500).send(err);
  }
});

movimentoRouter.put('/editar', async (req, res) => {
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
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = movimentoRouter;
