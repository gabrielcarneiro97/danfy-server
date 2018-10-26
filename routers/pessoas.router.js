const { pegarPessoaFlat } = require('../services/mongoose.service');

module.exports = {
  get: {
    flat(req, res) {
      const { pessoaId } = req.query;
      pegarPessoaFlat(pessoaId)
        .then(pessoa => res.send({ pessoa }))
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    },
  },
};