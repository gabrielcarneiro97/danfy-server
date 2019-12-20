import * as express from 'express';
import { pegarPessoaId } from '../services/postgres/pessoa.service';

const pessoasRouter = express();

pessoasRouter.get('/:pessoaId', async (req, res) => {
  const { pessoaId } = req.params;
  try {
    const pessoa = await pegarPessoaId(pessoaId);
    res.send(pessoa);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});


export default pessoasRouter;
