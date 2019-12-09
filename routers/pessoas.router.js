const express = require('express');
const { pegarPessoaId } = require('../services/postgres/pessoa.service');

const pessoasRouter = express();

pessoasRouter.get('/flat', async (req, res) => {
  const { pessoaId } = req.query;
  try {
    const pessoa = await pegarPessoaId(pessoaId);
    res.send(pessoa);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});


module.exports = pessoasRouter;
