const express = require('express');
const bodyParser = require('body-parser');

const {
  pegarDominioCodigo,
  adicionarEmpresa,
} = require('../services/postgres');

const { Usuario } = require('../services/postgres/models');

const dominioRouter = express();

const DOMINIO_PADRAO = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

dominioRouter.get('/', async (req, res) => {
  const { codigo } = req.query;
  try {
    const dominio = await pegarDominioCodigo(codigo);
    res.send(dominio);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});
dominioRouter.get('/id', async (req, res) => {
  const { uid } = req.query;
  try {
    const [user] = await Usuario.getBy('id', uid);
    const dominioCodigo = user ? user.dominioCodigo : DOMINIO_PADRAO;
    res.send(dominioCodigo);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

dominioRouter.post('/empresa', bodyParser.json(), async (req, res) => {
  const { numero, cnpj, dominioId } = req.body;

  try {
    await adicionarEmpresa(dominioId, numero, cnpj);
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = dominioRouter;
