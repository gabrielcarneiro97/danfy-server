import * as express from 'express';
import * as bodyParser from 'body-parser';

import {
  pegarEstoque,
  atualizarEstoque,
  inserirProduto,
} from '../services/postgres/estoque.service';

const estoqueRouter = express();

estoqueRouter.get('/:cpfcnpj', async (req, res) => {
  const { cpfcnpj } = req.params;
  const { data } = req.query;
  const estoque = await pegarEstoque(cpfcnpj, data);

  res.send(estoque);
});

estoqueRouter.put('/:cpfcnpj', async (req, res) => {
  const { cpfcnpj } = req.params;
  const { data } = req.query;

  const estoque = await atualizarEstoque(cpfcnpj, data);
  res.send(estoque);
});

estoqueRouter.put('/:cpfcnpj/:id', bodyParser.json(), async (req, res) => {
  const { cpfcnpj, id } = req.params;
  const estoqueProduto = req.body;
  if (parseInt(id, 10) !== estoqueProduto.id
  || cpfcnpj !== estoqueProduto.donoCpfcnpj) res.sendStatus(400);
  else {
    const ret = await inserirProduto(estoqueProduto);
    res.send(ret);
  }
});

estoqueRouter.post('/:cpfcnpj', bodyParser.json(), async (req, res) => {
  const { cpfcnpj } = req.params;
  const estoqueProduto = req.body;

  if (cpfcnpj !== estoqueProduto.donoCpfcnpj) res.sendStatus(400);
  else {
    const ret = await inserirProduto(estoqueProduto);
    res.send(ret);
  }
});

export default estoqueRouter;
