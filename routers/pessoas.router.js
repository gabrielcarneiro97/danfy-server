const { pegarPessoaId } = require('../services/postgres.service');

module.exports = {
  get: {
    flat(req, res) {
      const { pessoaId } = req.query;
      pegarPessoaId(pessoaId)
        .then(pessoa => res.send({ pessoa }))
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    },
  },
};