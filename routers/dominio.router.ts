import * as express from 'express';
import * as bodyParser from 'body-parser';

import { pegarDominioCodigo, adicionarEmpresa } from '../services/postgres/dominio.service';

import Usuario from '../services/postgres/models/usuario.model';

const dominioRouter = express();

const DOMINIO_PADRAO = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

dominioRouter.get('/id/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const [user] = await Usuario.getBy('id', uid);
    const dominioCodigo = user ? user.dominioCodigo : DOMINIO_PADRAO;
    res.send(dominioCodigo);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

dominioRouter.get('/codigo/:codigo', async (req, res) => {
  const { codigo } = req.params;
  try {
    const dominio = await pegarDominioCodigo(codigo);
    res.send(dominio);
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

export default dominioRouter;
