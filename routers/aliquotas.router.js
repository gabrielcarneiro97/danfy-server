const {
  pegarEmpresaAliquota,
  criarAliquota,
} = require('../services/postgres');

module.exports = {
  post: {
    root(req, res) {
      const { cnpj, aliquotas } = req.body;

      criarAliquota(cnpj, aliquotas).then(() => {
        res.sendStatus(201);
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
  },
  get: {
    root(req, res) {
      const { cnpj } = req.query;

      pegarEmpresaAliquota(cnpj).then((aliquota) => {
        res.send(aliquota);
      }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
    },
  },
};
