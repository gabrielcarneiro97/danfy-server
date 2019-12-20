import * as express from 'express';
import * as bodyParser from 'body-parser';

import {
  pegarMovimentoPoolNotaFinal,
  cancelarMovimento,
  pegarMovimentoPoolId,
  movimentoPoolFromObj,
} from '../services/postgres/movimento.service';

import {
  criarNotaPoolSlim,
  pegarNotasPoolProdutoEmitente,
} from '../services/postgres/nota.service';

import { validarMovimento } from '../services/calculador.service';

import { calcularMovimentoPool } from '../services/impostos.service';

import {
  pegarTrimestreComNotas,
  recalcularTrimestre,
} from '../services/trimestre.service';

import {
  pegarSimplesComNotas,
  recalcularSimples,
} from '../services/simples.service';

import Aliquota from '../services/postgres/models/aliquota.model';

import NotaPool from '../services/postgres/pools/nota.pool';

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
      await movimentoExiste.save();
      res.sendStatus(201);
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
movimentoRouter.get('/slim/:cnpj', async (req, res) => {
  const { cnpj } = req.params;
  const { notaFinalChave } = req.query;
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

movimentoRouter.put('/cancelar/:cnpj/:movimentoId', async (req, res) => {
  const { cnpj, movimentoId } = req.params;

  try {
    await cancelarMovimento(movimentoId);
    const movimentoPool = await pegarMovimentoPoolId(movimentoId);

    const { movimento } = movimentoPool;

    const mes = (movimento.dataHora.getMonth() + 1);
    const ano = movimento.dataHora.getFullYear();

    await recalcularTrimestre(cnpj, { mes, ano });

    const trim = await pegarTrimestreComNotas(cnpj, { mes, ano });

    res.send(trim);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

movimentoRouter.put('/editar/:cnpj/:movimentoAntigoId', bodyParser.json(), async (req, res) => {
  const { cnpj, movimentoAntigoId } = req.params;
  const { movimentoNovoObj } = req.body;

  const movimentoData = new Date(movimentoNovoObj.movimento.dataHora);

  const mes = (movimentoData.getMonth() + 1);
  const ano = movimentoData.getFullYear();

  try {
    const movimentoPoolNovo = await movimentoPoolFromObj(movimentoNovoObj);
    await cancelarMovimento(movimentoAntigoId);
    await movimentoPoolNovo.save();

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

export default movimentoRouter;
