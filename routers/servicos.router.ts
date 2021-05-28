import * as express from 'express';
import * as bodyParser from 'body-parser';

import {
  servicoPoolFromObj,
} from '../services/postgres/servico.service';

import {
  calcularServicoPool,
} from '../services/impostos.service';

import {
  pegarTrimestreComNotas,
  recalcularTrimestre,
} from '../services/trimestre.service';

import {
  pegarSimplesComNotas,
  recalcularSimples,
} from '../services/simples.service';

import { dateToComp } from '../services/calculador.service';

import ServicoPool from '../services/postgres/pools/servico.pool';
import { pegarEmpresaAliquota } from '../services/postgres/aliquota.service';

const servicosRouter = express();

servicosRouter.get('/calcular/:notaServicoChave', async (req, res) => {
  let { notaServicoChave } = req.params;
  notaServicoChave = decodeURI(notaServicoChave);
  try {
    const servicoPool = await calcularServicoPool(notaServicoChave);
    res.send(servicoPool);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

servicosRouter.get('/id/:cnpj/:servicoId', async (req, res) => {
  try {
    const { cnpj, servicoId } = req.params;
    const servicoPool = await ServicoPool.getById(parseInt(servicoId, 10));
    if (servicoPool.servico.donoCpfcnpj === cnpj) res.send(servicoPool);
    else res.send(null);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

servicosRouter.get('/nota', async (req, res) => {
  const { notaChave } = req.query as { notaChave: string };
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

servicosRouter.delete('/:cnpj/:servicoId', async (req, res) => {
  const { servicoId, cnpj } = req.params;

  try {
    const servicoPool = await ServicoPool.getById(parseInt(servicoId, 10));

    const data = new Date(servicoPool.servico.dataHora);
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();

    await servicoPool.del();

    const aliquota = await pegarEmpresaAliquota(cnpj);

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

servicosRouter.put('/:id', bodyParser.json(), async (req, res) => {
  const { id } = req.params;
  const { grupoId } = req.body;

  const servicoPool = await ServicoPool.getById(parseInt(id, 10));

  servicoPool.servico.grupoId = grupoId;

  await servicoPool.save();

  const cnpj = servicoPool.servico.donoCpfcnpj;

  const { mes, ano } = dateToComp(servicoPool.servico.dataHora);

  const aliquota = await pegarEmpresaAliquota(cnpj);

  if (aliquota.tributacao === 'SN') {
    await recalcularSimples(cnpj, { mes, ano });
    const simples = await pegarSimplesComNotas(cnpj, { mes, ano });
    res.send(simples);
  } else {
    await recalcularTrimestre(cnpj, { mes, ano });
    const trim = await pegarTrimestreComNotas(cnpj, { mes, ano });
    res.send(trim);
  }
});

export default servicosRouter;
